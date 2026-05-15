import { of } from 'rxjs';
import { ShipmentFacade } from './shipment.facade';

describe('ShipmentFacade', () => {
  it('adds merchantId from auth profile to shipment list filters', async () => {
    const repo = {
      findAll: jest.fn().mockReturnValue(of({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      })),
    };
    const facade = new ShipmentFacade(repo as any, { user: jest.fn(() => ({ merchantId: 'merchant-1' })) } as any);

    await facade.loadShipments({ page: 1, limit: 10 });

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, merchantId: 'merchant-1' });
  });

  it('does not call the repository when merchantId is missing', async () => {
    const repo = { findAll: jest.fn() };
    const facade = new ShipmentFacade(repo as any, { user: jest.fn(() => ({})) } as any);

    await facade.loadShipments({ page: 1, limit: 10 });

    expect(repo.findAll).not.toHaveBeenCalled();
    expect(facade.error()).toBe('Merchant account is missing from your profile');
  });
});
