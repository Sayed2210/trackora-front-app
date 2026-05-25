import { Component } from '@angular/core';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  ForbiddenStateComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  StatCardComponent,
  StatusBadgeComponent,
  statusBadgeTone,
} from './dashboard-ui-primitives';

@Component({
  imports: [PageHeaderComponent],
  template: `
    <app-owner-page-header
      title="لوحة المالك"
      description="مؤشرات تشغيلية مشتركة"
      [breadcrumbs]="breadcrumbs"
    >
      <button page-actions type="button">تصدير</button>
    </app-owner-page-header>
  `,
})
class PageHeaderHostComponent {
  breadcrumbs = [{ label: 'الرئيسية' }, { label: 'المالك' }];
}

describe('owner dashboard UI primitives', () => {
  it('renders stat card required content', async () => {
    const fixture = await createComponent(StatCardComponent, {
      title: 'إجمالي المستأجرين',
      value: '128',
      subtitle: 'نشط هذا الشهر',
      severity: 'success',
    });

    expect(fixture.nativeElement.textContent).toContain('إجمالي المستأجرين');
    expect(fixture.nativeElement.textContent).toContain('128');
    expect(fixture.nativeElement.textContent).toContain('نشط هذا الشهر');
  });

  it('maps owner statuses to badge tones', async () => {
    expect(statusBadgeTone('TRIAL')).toBe('info');
    expect(statusBadgeTone('ACTIVE')).toBe('success');
    expect(statusBadgeTone('PAST_DUE')).toBe('warning');
    expect(statusBadgeTone('SUSPENDED')).toBe('danger');
    expect(statusBadgeTone('CANCELLED')).toBe('neutral');
    expect(statusBadgeTone('TRIALING')).toBe('info');
    expect(statusBadgeTone('PAUSED')).toBe('warning');
    expect(statusBadgeTone('EXPIRED')).toBe('neutral');
    expect(statusBadgeTone('NOT_REQUIRED')).toBe('neutral');
    expect(statusBadgeTone('PENDING')).toBe('warning');
    expect(statusBadgeTone('PAID')).toBe('success');
    expect(statusBadgeTone('FAILED')).toBe('danger');

    const fixture = await createComponent(StatusBadgeComponent, {
      status: 'PAID',
    });

    expect(fixture.nativeElement.textContent).toContain('Paid');
    expect(fixture.nativeElement.querySelector('.tone-success')).toBeTruthy();
  });

  it('renders page header inputs and projected actions', async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PageHeaderHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('لوحة المالك');
    expect(fixture.nativeElement.textContent).toContain(
      'مؤشرات تشغيلية مشتركة',
    );
    expect(fixture.nativeElement.textContent).toContain('الرئيسية');
    expect(fixture.nativeElement.textContent).toContain('تصدير');
  });

  it('renders empty, error, and forbidden states', async () => {
    const empty = await createComponent(EmptyStateComponent, {
      title: 'لا توجد نتائج',
      message: 'غير عوامل التصفية.',
    });
    const error = await createComponent(ErrorStateComponent, {
      title: 'تعذر التحميل',
      message: 'أعد المحاولة.',
    });
    const forbidden = await createComponent(ForbiddenStateComponent, {
      title: 'غير مصرح',
      message: 'تحتاج صلاحية إضافية.',
    });

    expect(empty.nativeElement.textContent).toContain('لا توجد نتائج');
    expect(error.nativeElement.textContent).toContain('تعذر التحميل');
    expect(forbidden.nativeElement.textContent).toContain('غير مصرح');
  });

  it('requires a reason before confirming', async () => {
    const fixture = await createComponent(ReasonRequiredDialogComponent, {
      open: true,
      title: 'تعليق مستأجر',
      message: 'اكتب سبب العملية.',
    });
    const component = fixture.componentInstance;
    const confirm = vi.spyOn(component.reasonConfirm, 'emit');
    const button = fixture.nativeElement.querySelector(
      '.dialog__button--primary',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    component.submitReason();
    fixture.detectChanges();

    expect(confirm).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Reason is required.');

    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    textarea.value = 'Violation confirmed by owner operations';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (
        fixture.nativeElement.querySelector(
          '.dialog__button--primary',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(false);

    component.submitReason();

    expect(confirm).toHaveBeenCalledWith(
      'Violation confirmed by owner operations',
    );
  });
});

async function createComponent<T>(
  component: Type<T>,
  inputs: Record<string, unknown>,
): Promise<ComponentFixture<T>> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [component],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();

  return fixture;
}
