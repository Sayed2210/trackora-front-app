import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NEVER, of, throwError } from 'rxjs';
import { PlatformAuditLogsRepository } from '../../../infrastructure/platform-audit-logs.repository';
import { AuditLogsPageComponent } from './audit-logs-page.component';

describe('AuditLogsPageComponent', () => {
  it('renders loading, empty, error, and data states', async () => {
    TestBed.configureTestingModule({
      imports: [AuditLogsPageComponent],
      providers: [
        {
          provide: PlatformAuditLogsRepository,
          useValue: { list: () => NEVER },
        },
      ],
    });
    const loadingFixture = TestBed.createComponent(AuditLogsPageComponent);
    loadingFixture.detectChanges();
    expect(loadingFixture.nativeElement.textContent).toContain(
      'جاري تحميل سجلات التدقيق',
    );

    const dataFixture = await createComponent(() => of(page));
    expect(dataFixture.nativeElement.textContent).toContain('TENANT_UPDATED');
    expect(dataFixture.nativeElement.textContent).toContain('Owner');
    expect(dataFixture.nativeElement.textContent).toContain('[MASKED]');

    const emptyFixture = await createComponent(() =>
      of({ ...page, items: [], total: 0 }),
    );
    expect(emptyFixture.nativeElement.textContent).toContain(
      'لا توجد سجلات تدقيق',
    );

    const errorFixture = await createComponent(() =>
      throwError(() => new Error('private')),
    );
    expect(errorFixture.nativeElement.textContent).toContain(
      'تعذر تحميل سجلات التدقيق',
    );
  });

  it('updates query state when filters are applied', async () => {
    const repository = { list: vi.fn(() => of(page)) };
    const fixture = await createComponent(repository.list);
    const component = fixture.componentInstance as unknown as {
      actor: string;
      applyFilters: () => void;
    };
    component.actor = 'Owner';
    component.applyFilters();
    await fixture.whenStable();

    expect(repository.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ actor: 'Owner' }),
    );
  });
});

const createComponent = async (
  logsFactory: (...args: unknown[]) => unknown,
) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [AuditLogsPageComponent, FormsModule],
    providers: [
      { provide: PlatformAuditLogsRepository, useValue: { list: logsFactory } },
    ],
  });
  const fixture = TestBed.createComponent(AuditLogsPageComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
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
      oldValue: { password: '[MASKED]' },
      newValue: { name: 'Acme' },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};
