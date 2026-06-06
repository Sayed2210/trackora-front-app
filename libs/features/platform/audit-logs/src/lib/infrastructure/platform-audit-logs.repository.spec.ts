import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@trackora/core/api';
import { of } from 'rxjs';
import { PlatformAuditLogsRepository } from './platform-audit-logs.repository';

describe('PlatformAuditLogsRepository', () => {
  it('maps audit log list response and sends filters', () => {
    const api = {
      get: vi.fn(() =>
        of({
          data: [
            {
              id: 'log-1',
              action: 'TENANT_UPDATED',
              actor: {
                name: 'Owner',
                email: 'owner@trackora.test',
                role: 'PLATFORM_OWNER',
              },
              tenant: { id: 'tenant-1', name: 'Acme' },
              resourceType: 'tenant',
              resourceId: 'tenant-1',
              newValue: { settings: { accessToken: 'secret-token' } },
            },
          ],
          meta: { total: 1, page: 2, limit: 20 },
        }),
      ),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({
      providers: [
        PlatformAuditLogsRepository,
        { provide: ApiClient, useValue: api },
      ],
    });
    const repository = TestBed.inject(PlatformAuditLogsRepository);

    repository
      .list({ actor: 'Owner', tenant: 'Acme', page: 2, pageSize: 20 })
      .subscribe((page) => {
        expect(page.items[0].actor.email).toBe('owner@trackora.test');
        expect(page.items[0].tenant?.name).toBe('Acme');
        expect(page.items[0].newValue).toEqual({
          settings: { accessToken: '[MASKED]' },
        });
        expect(page.total).toBe(1);
      });

    expect(api.get).toHaveBeenCalledWith('/platform/audit-logs', {
      actor: 'Owner',
      tenant: 'Acme',
      page: 2,
      pageSize: 20,
    });
  });
});
