import {
  mapImpersonationContext,
  mapTenantHealth,
  mapTenantSearchPage,
} from './support.mapper';

describe('support mapper', () => {
  it('maps tenant search summaries safely', () => {
    const page = mapTenantSearchPage({
      data: [
        {
          id: 't1',
          name: 'Acme',
          slug: 'acme',
          email: 'ops@test.com',
          status: 'ACTIVE',
        },
      ],
      meta: { total: 1, page: 2, limit: 20 },
    });

    expect(page.items[0].name).toBe('Acme');
    expect(page.items[0].status).toBe('ACTIVE');
    expect(page.page).toBe(2);
  });

  it('maps tenant health without private shipment details', () => {
    const health = mapTenantHealth({
      tenant: { id: 't1', name: 'Acme', status: 'PAST_DUE' },
      subscription: { status: 'ACTIVE' },
      billing: { paymentStatus: 'PAST_DUE' },
      usageWarnings: [{ label: 'Storage', value: '90%', status: 'warning' }],
      alerts: [{ id: 'a1', message: 'Webhook failing', severity: 'danger' }],
    });

    expect(health.tenant.status).toBe('PAST_DUE');
    expect(health.paymentStatus).toBe('PAST_DUE');
    expect(health.usageWarnings[0].label).toBe('Storage');
    expect(health.recentAlerts[0].severity).toBe('danger');
  });

  it('normalizes impersonation context from auth state', () => {
    expect(
      mapImpersonationContext({
        tenant: { id: 't1', name: 'Acme' },
        user: { id: 'u1', name: 'Tenant Admin', role: 'ADMIN' },
        startedAt: '2026-05-25T10:00:00.000Z',
      }),
    ).toEqual(
      expect.objectContaining({
        tenantId: 't1',
        tenantName: 'Acme',
        userName: 'Tenant Admin',
        role: 'ADMIN',
      }),
    );
  });
});
