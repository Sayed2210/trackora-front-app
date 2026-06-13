import { TestBed } from '@angular/core/testing';
import { ApiClientError } from '@trackora/core/api';
import { of, throwError } from 'rxjs';
import { PlatformAuditLogsRepository } from '../infrastructure/platform-audit-logs.repository';
import { AuditLogsFacade } from './audit-logs.facade';

describe('AuditLogsFacade', () => {
  it('handles loading data and query updates', async () => {
    const repository = { list: vi.fn(() => of(page)) };
    const facade = createFacade(repository);

    await facade.load({ actor: 'Owner' });

    expect(repository.list).toHaveBeenCalledWith(
      expect.objectContaining({ actor: 'Owner', page: 1 }),
    );
    expect(facade.items()[0].action).toBe('TENANT_UPDATED');
    expect(facade.query().actor).toBe('Owner');
    expect(facade.empty()).toBe(false);
  });

  it('maps API errors to safe messages', async () => {
    const facade = createFacade({
      list: () =>
        throwError(
          () =>
            new ApiClientError({ code: 'FORBIDDEN', message: 'private' }, 403),
        ),
    });

    await facade.load();

    expect(facade.logs().error).toContain('صلاحية');
  });
});

const createFacade = (repository: unknown): AuditLogsFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      AuditLogsFacade,
      { provide: PlatformAuditLogsRepository, useValue: repository },
    ],
  });
  return TestBed.inject(AuditLogsFacade);
};

const page = {
  items: [
    {
      id: 'log-1',
      action: 'TENANT_UPDATED',
      actor: {
        id: 'u1',
        name: 'Owner',
        email: 'owner@test.com',
        role: 'PLATFORM_OWNER',
      },
      tenant: { id: 'tenant-1', name: 'Acme', slug: 'acme' },
      resourceType: 'tenant',
      resourceId: 'tenant-1',
      reason: 'Support review',
      timestamp: '2026-05-25T10:00:00.000Z',
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
      status: 'SUCCESS',
      severity: 'success' as const,
      oldValue: { name: 'Old' },
      newValue: { name: 'New' },
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};
