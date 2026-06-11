import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-owner-forbidden-page',
  template: `
    <section class="forbidden-page" data-testid="forbidden-state">
      <span>403</span>
      <h1>ليس لديك صلاحية للوصول لهذه الصفحة</h1>
      <p>يرجى الرجوع للوحة النظام أو التواصل مع مسؤول المنصة.</p>
      <button type="button" (click)="goBack()">رجوع</button>
    </section>
  `,
  styles: [
    `
      .forbidden-page {
        display: grid;
        gap: 0.75rem;
        max-width: 720px;
        padding: 1.5rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-inline-start: 6px solid var(--trackora-danger);
        border-radius: 1.25rem;
      }

      span {
        color: var(--trackora-danger);
        font-weight: 800;
      }

      h1 {
        margin: 0;
        color: var(--trackora-primary);
      }

      p {
        margin: 0;
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }

      button {
        width: fit-content;
        margin-top: 0.5rem;
        padding: 0.7rem 1rem;
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        font-weight: 700;
      }
    `,
  ],
})
export class ForbiddenPageComponent {
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
