import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourierRepository } from '@trackora/shared/data-access';
import { OfflineSyncService } from './offline-sync.service';
import { PendingUpdate } from './offline-store.service';

describe('OfflineSyncService', () => {
  const courierRepo = {
    updateTaskStatus: vi.fn(),
    logDeposit: vi.fn(),
  };

  beforeEach(() => {
    courierRepo.updateTaskStatus.mockReturnValue(of({}));
    courierRepo.logDeposit.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        OfflineSyncService,
        { provide: CourierRepository, useValue: courierRepo },
      ],
    });
  });

  it('sends the full queued status payload to the courier task status API', async () => {
    const service = TestBed.inject(OfflineSyncService);
    const payload = {
      status: 'DELIVERED',
      otp: '1234',
      collectedCash: 450,
      notes: 'Customer signed',
      photoUrl: 'https://storage.example/photo.jpg',
      signatureUrl: 'https://storage.example/signature.png',
      gpsLocation: { lat: 29.96, lng: 31.25 },
    };

    await (service as any).sendUpdate({
      id: 'update-1',
      taskId: 'shipment-1',
      type: 'STATUS_UPDATE',
      payload,
      createdAt: '2026-05-11T00:00:00.000Z',
      retryCount: 0,
    } satisfies PendingUpdate);

    expect(courierRepo.updateTaskStatus).toHaveBeenCalledWith('shipment-1', payload);
  });

  it('syncs cash deposits through the courier deposits API', async () => {
    const service = TestBed.inject(OfflineSyncService);

    await (service as any).sendUpdate({
      id: 'deposit-1',
      taskId: 'admin-user-1',
      type: 'CASH_DEPOSIT',
      payload: {
        amount: 1500,
        depositedTo: 'admin-user-1',
        notes: 'Daily collection',
      },
      createdAt: '2026-05-11T00:00:00.000Z',
      retryCount: 0,
    } satisfies PendingUpdate);

    expect(courierRepo.logDeposit).toHaveBeenCalledWith({
      amount: 1500,
      depositedTo: 'admin-user-1',
      notes: 'Daily collection',
    });
  });
});
