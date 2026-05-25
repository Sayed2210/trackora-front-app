import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PlanPayload } from '../../domain/models/platform-plan.models';
import { PlanFormComponent } from './plan-form.component';

@Component({
  imports: [PlanFormComponent],
  template: `<app-plan-form (formSubmit)="submitted = $event" />`,
})
class HostComponent {
  submitted: PlanPayload | null = null;
}

describe('PlanFormComponent', () => {
  it('validates required fields before submit', async () => {
    const fixture = await createFixture();
    fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit');
    fixture.detectChanges();
    expect(fixture.componentInstance.submitted).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Name is required');
  });

  it('submits valid backend-supported fields and entitlements', async () => {
    const fixture = await createFixture();
    const form = fixture.debugElement.query(By.directive(PlanFormComponent)).componentInstance as PlanFormComponent;
    form.form.patchValue({ name: 'Growth', price: 150, monthlyShipments: 1000 });
    form.toggleEntitlement('smart_dispatch');
    form.submit();
    expect(fixture.componentInstance.submitted?.entitlements).toEqual(['smart_dispatch']);
    expect(fixture.componentInstance.submitted?.limits.monthlyShipments).toBe(1000);
  });
});

const createFixture = async (): Promise<ComponentFixture<HostComponent>> => {
  await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
};
