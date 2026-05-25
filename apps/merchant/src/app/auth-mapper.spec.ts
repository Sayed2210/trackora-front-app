import { describe, expect, it } from 'vitest';
import { AuthMapper } from '@trackora/shared/data-access';
import { Permission, UserRole } from '@trackora/shared/domain';

describe('AuthMapper', () => {
  it('preserves merchant and courier account IDs from the auth profile', () => {
    const user = AuthMapper.mapUser({
      id: 'user-1',
      name: 'Ahmed',
      phone: '01000000000',
      roles: [UserRole.MERCHANT],
      permissions: [Permission.SHIPMENTS_READ_OWN],
      merchantId: 'merchant-1',
      courierId: 'courier-1',
      isActive: true,
      createdAt: '2026-05-11T00:00:00.000Z',
      updatedAt: '2026-05-11T00:00:00.000Z',
    });

    expect(user.merchantId).toBe('merchant-1');
    expect(user.courierId).toBe('courier-1');
  });
});
