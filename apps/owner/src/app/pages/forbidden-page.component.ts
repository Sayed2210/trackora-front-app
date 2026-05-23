import { Component } from '@angular/core';

@Component({
  selector: 'app-owner-forbidden-page',
  template: `
    <section class="forbidden-page">
      <span>403</span>
      <h1>Access forbidden</h1>
      <p>
        This placeholder is reserved for Phase 2 platform role and permission
        guard flows.
      </p>
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
    `,
  ],
})
export class ForbiddenPageComponent {}
