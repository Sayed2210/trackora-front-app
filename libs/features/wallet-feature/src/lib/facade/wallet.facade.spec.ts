import { of } from 'rxjs';
import { WalletFacade } from './wallet.facade';

describe('WalletFacade', () => {
  it('loads merchant-scoped wallet and transactions', async () => {
    const repo = {
      getMerchantWallet: jest.fn().mockReturnValue(of({
        id: 'wallet-1',
        merchantId: 'merchant-1',
        availableBalance: 1000,
        pendingBalance: 50,
        totalCredited: 1500,
        totalDebited: 500,
        currency: 'EGP',
        updatedAt: '2026-05-15T00:00:00.000Z',
      })),
      getMerchantTransactions: jest.fn().mockReturnValue(of({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } })),
    };
    const auth = { user: jest.fn(() => ({ merchantId: 'merchant-1' })) };
    const facade = new WalletFacade(repo as any, auth as any);

    await facade.loadWallet();
    await facade.loadTransactions();

    expect(repo.getMerchantWallet).toHaveBeenCalledWith('merchant-1');
    expect(repo.getMerchantTransactions).toHaveBeenCalledWith('merchant-1', { page: '1', limit: '20' });
    expect(facade.availableBalance()).toBe(1000);
  });

  it('sets an error when the auth profile has no merchant id', async () => {
    const repo = { getMerchantWallet: jest.fn(), getMerchantTransactions: jest.fn() };
    const facade = new WalletFacade(repo as any, { user: jest.fn(() => ({})) } as any);

    await facade.loadWallet();

    expect(repo.getMerchantWallet).not.toHaveBeenCalled();
    expect(facade.error()).toBe('Merchant account is missing from your profile');
  });
});
