import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { TenantCreatePageComponent } from './tenant-create-page.component';

describe('TenantCreatePageComponent', () => {
  it('validates required fields before creating tenant', async () => {
    const api = { post: vi.fn(() => of({ id: 't1', name: 'Acme', slug: 'acme', email: 'owner@acme.test', status: 'ACTIVE' })) };
    await TestBed.configureTestingModule({
      imports: [TenantCreatePageComponent],
      providers: [provideRouter([]), { provide: ApiClient, useValue: api }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TenantCreatePageComponent);
    fixture.detectChanges();

    await fixture.componentInstance.submit({ invalid: true } as NgForm);
    fixture.detectChanges();

    expect(api.post).not.toHaveBeenCalled();
  });
});
