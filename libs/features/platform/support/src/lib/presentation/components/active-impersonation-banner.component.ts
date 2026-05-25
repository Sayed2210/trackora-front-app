import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupportFacade } from '../../application/support.facade';

@Component({
  selector: 'app-active-impersonation-banner',
  imports: [CommonModule, RouterLink],
  providers: [SupportFacade],
  template: `
    @if (facade.impersonationContext(); as context) {
      <section class="impersonation-banner" role="status" aria-live="polite">
        <div>
          <strong>وضع الانتحال نشط</strong>
          <span>
            {{
              context.tenantName || context.tenantId || 'Tenant not returned'
            }}
            @if (context.userName || context.userEmail || context.role) {
              - {{ context.userName || context.userEmail || context.role }}
            }
          </span>
          <small>Started: {{ formatDate(context.startedAt) }}</small>
        </div>
        <div class="banner-actions">
          <a routerLink="/owner/support/impersonation">Details</a>
          <button
            type="button"
            [disabled]="facade.mutation().loading"
            (click)="endImpersonation()"
          >
            End impersonation
          </button>
        </div>
      </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 1rem 1.5rem 0;
      }
      :host:empty {
        display: none;
      }
      .impersonation-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.9rem 1rem;
        color: var(--trackora-primary);
        background: color-mix(
          in srgb,
          var(--trackora-warning) 18%,
          var(--trackora-bg)
        );
        border: 1px solid
          color-mix(
            in srgb,
            var(--trackora-warning) 45%,
            var(--trackora-border)
          );
        border-radius: 0.95rem;
        font-weight: 800;
      }
      strong,
      span,
      small {
        display: block;
      }
      span,
      small {
        margin-block-start: 0.18rem;
        color: var(--trackora-text-secondary);
      }
      .banner-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }
      a,
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.62rem 0.85rem;
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
        cursor: pointer;
        text-decoration: none;
        font-weight: 900;
      }
      button {
        color: var(--trackora-primary-contrast);
        background: var(--trackora-warning);
        border-color: var(--trackora-warning);
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.58;
      }
      @media (max-width: 760px) {
        .impersonation-banner {
          align-items: stretch;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ActiveImpersonationBannerComponent {
  protected readonly facade = inject(SupportFacade);

  protected async endImpersonation(): Promise<void> {
    await this.facade.endImpersonation();
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Not returned';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }
}
