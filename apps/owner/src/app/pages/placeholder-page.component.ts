import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-owner-placeholder-page',
  template: `
    <section class="placeholder-page">
      <div class="placeholder-page__eyebrow">{{ module }}</div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>

      <div class="placeholder-card">
        <strong>Phase 1 placeholder</strong>
        <span>
          This route is wired for the System Owner app shell. Feature logic, API
          integration, auth guards, and permission guards are scheduled for
          later phases.
        </span>
      </div>
    </section>
  `,
  styles: [
    `
      .placeholder-page {
        display: grid;
        gap: 1rem;
        max-width: 920px;
        padding: 1.5rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1.25rem;
        box-shadow: 0 18px 45px rgba(26, 59, 102, 0.08);
      }

      .placeholder-page__eyebrow {
        width: fit-content;
        padding: 0.35rem 0.65rem;
        color: var(--trackora-primary);
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.18);
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        color: var(--trackora-primary);
        font-size: clamp(2rem, 4vw, 3.25rem);
        line-height: 1.05;
      }

      p {
        max-width: 62ch;
        margin: 0;
        color: var(--trackora-text-secondary);
        font-size: 1rem;
        line-height: 1.7;
      }

      .placeholder-card {
        display: grid;
        gap: 0.4rem;
        margin-top: 0.75rem;
        padding: 1rem;
        background: var(--trackora-surface);
        border: 1px dashed var(--trackora-border);
        border-radius: 1rem;
      }

      .placeholder-card strong {
        color: var(--trackora-primary);
      }

      .placeholder-card span {
        color: var(--trackora-text-secondary);
      }
    `,
  ],
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = this.route.snapshot.data['title'] as string;
  protected readonly module = this.route.snapshot.data['module'] as string;
  protected readonly description = this.route.snapshot.data[
    'description'
  ] as string;
}
