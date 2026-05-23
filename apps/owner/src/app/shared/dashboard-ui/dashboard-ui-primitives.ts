import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type DashboardSeverity =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type DashboardStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'TRIALING'
  | 'PAUSED'
  | 'EXPIRED'
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | DashboardSeverity;

export interface PageBreadcrumb {
  label: string;
  href?: string;
}

export interface ActionMenuItem {
  label: string;
  disabled?: boolean;
  severity?: DashboardSeverity;
}

const STATUS_TONES: Record<DashboardStatus, DashboardSeverity> = {
  TRIAL: 'info',
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  SUSPENDED: 'danger',
  CANCELLED: 'neutral',
  TRIALING: 'info',
  PAUSED: 'warning',
  EXPIRED: 'neutral',
  NOT_REQUIRED: 'neutral',
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
};

export const statusBadgeTone = (status: DashboardStatus): DashboardSeverity =>
  STATUS_TONES[status] ?? 'neutral';

const humanizeStatus = (status: DashboardStatus): string =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

@Component({
  selector: 'app-owner-status-badge',
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'status-badge tone-' + tone">
      <span class="status-badge__dot" aria-hidden="true"></span>
      {{ label || displayLabel }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        width: fit-content;
        padding-block: 0.32rem;
        padding-inline: 0.62rem;
        border: 1px solid var(--trackora-border);
        border-radius: 999px;
        color: var(--trackora-text-secondary);
        background: var(--trackora-surface);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.01em;
        white-space: nowrap;
      }

      .status-badge__dot {
        inline-size: 0.45rem;
        block-size: 0.45rem;
        border-radius: 999px;
        background: currentColor;
      }

      .tone-success {
        color: var(--trackora-success);
        background: color-mix(in srgb, var(--trackora-success) 10%, var(--trackora-bg));
        border-color: color-mix(in srgb, var(--trackora-success) 28%, var(--trackora-border));
      }

      .tone-warning {
        color: var(--trackora-warning);
        background: color-mix(in srgb, var(--trackora-warning) 12%, var(--trackora-bg));
        border-color: color-mix(in srgb, var(--trackora-warning) 32%, var(--trackora-border));
      }

      .tone-danger {
        color: var(--trackora-danger);
        background: color-mix(in srgb, var(--trackora-danger) 10%, var(--trackora-bg));
        border-color: color-mix(in srgb, var(--trackora-danger) 30%, var(--trackora-border));
      }

      .tone-info {
        color: var(--trackora-info);
        background: color-mix(in srgb, var(--trackora-info) 10%, var(--trackora-bg));
        border-color: color-mix(in srgb, var(--trackora-info) 28%, var(--trackora-border));
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: DashboardStatus;
  @Input() label = '';

  get tone(): DashboardSeverity {
    return statusBadgeTone(this.status);
  }

  get displayLabel(): string {
    return humanizeStatus(this.status);
  }
}

@Component({
  selector: 'app-owner-stat-card',
  imports: [CommonModule],
  template: `
    <article class="stat-card" [class]="'stat-card tone-' + severity">
      <div class="stat-card__top">
        <div>
          <p class="stat-card__title">{{ title }}</p>
          @if (loading) {
            <span class="stat-card__skeleton" aria-label="Loading metric"></span>
          } @else if (empty || value === null || value === undefined || value === '') {
            <strong class="stat-card__empty">{{ emptyLabel }}</strong>
          } @else {
            <strong class="stat-card__value">{{ value }}</strong>
          }
        </div>
        @if (icon) {
          <span class="stat-card__icon" aria-hidden="true">{{ icon }}</span>
        }
      </div>
      @if (!loading && (subtitle || changeText)) {
        <p class="stat-card__subtitle">{{ subtitle || changeText }}</p>
      }
    </article>
  `,
  styles: [
    `
      .stat-card {
        display: grid;
        gap: 1rem;
        min-block-size: 9rem;
        padding: 1.15rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1.1rem;
        border-block-start: 4px solid var(--trackora-border);
        box-shadow: 0 18px 45px color-mix(in srgb, var(--trackora-primary) 10%, transparent);
      }

      .stat-card__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .stat-card__title,
      .stat-card__subtitle {
        margin: 0;
        color: var(--trackora-text-secondary);
        line-height: 1.6;
      }

      .stat-card__title {
        font-size: 0.85rem;
        font-weight: 800;
      }

      .stat-card__value,
      .stat-card__empty {
        display: block;
        margin-block-start: 0.35rem;
        color: var(--trackora-primary);
        font-family: var(--font-header);
        font-size: clamp(1.65rem, 3vw, 2.25rem);
        line-height: 1;
      }

      .stat-card__empty {
        color: var(--trackora-text-secondary);
        font-size: 1rem;
      }

      .stat-card__icon {
        display: grid;
        inline-size: 2.65rem;
        block-size: 2.65rem;
        place-items: center;
        color: var(--trackora-primary);
        background: color-mix(in srgb, var(--trackora-primary) 10%, var(--trackora-bg));
        border: 1px solid var(--trackora-border);
        border-radius: 0.95rem;
        font-weight: 900;
      }

      .stat-card__skeleton {
        display: block;
        inline-size: min(11rem, 80%);
        block-size: 2rem;
        margin-block-start: 0.55rem;
        border-radius: 0.55rem;
        background: linear-gradient(90deg, var(--trackora-surface), var(--trackora-bg), var(--trackora-surface));
      }

      .tone-success { border-block-start-color: var(--trackora-success); }
      .tone-warning { border-block-start-color: var(--trackora-warning); }
      .tone-danger { border-block-start-color: var(--trackora-danger); }
      .tone-info { border-block-start-color: var(--trackora-info); }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input() value: string | number | null | undefined;
  @Input() subtitle = '';
  @Input() changeText = '';
  @Input() severity: DashboardSeverity = 'neutral';
  @Input() set status(value: DashboardSeverity) {
    this.severity = value;
  }
  @Input() icon = '';
  @Input() loading = false;
  @Input() empty = false;
  @Input() emptyLabel = 'No data';
}

@Component({
  selector: 'app-owner-page-header',
  imports: [CommonModule],
  template: `
    <header class="page-header">
      @if (breadcrumbs.length) {
        <nav class="page-header__breadcrumbs" aria-label="Breadcrumbs">
          @for (breadcrumb of breadcrumbs; track breadcrumb.label) {
            @if (breadcrumb.href) {
              <a [href]="breadcrumb.href">{{ breadcrumb.label }}</a>
            } @else {
              <span>{{ breadcrumb.label }}</span>
            }
          }
        </nav>
      }
      <div class="page-header__content">
        <div>
          <h1>{{ title }}</h1>
          @if (description) {
            <p>{{ description }}</p>
          }
        </div>
        <div class="page-header__actions">
          <ng-content select="[page-actions]"></ng-content>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .page-header {
        display: grid;
        gap: 0.75rem;
        margin-block-end: 1.25rem;
      }

      .page-header__breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        color: var(--trackora-text-secondary);
        font-size: 0.82rem;
      }

      .page-header__breadcrumbs a,
      .page-header__breadcrumbs span {
        color: inherit;
        text-decoration: none;
      }

      .page-header__breadcrumbs a::after,
      .page-header__breadcrumbs span:not(:last-child)::after {
        margin-inline: 0.45rem 0;
        color: var(--trackora-border);
        content: '/';
      }

      .page-header__content {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        color: var(--trackora-primary);
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.05;
      }

      p {
        max-inline-size: 70ch;
        margin-block-start: 0.5rem;
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }

      .page-header__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.6rem;
      }

      @media (max-width: 760px) {
        .page-header__content {
          align-items: stretch;
          flex-direction: column;
        }

        .page-header__actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() breadcrumbs: PageBreadcrumb[] = [];
}

@Component({
  selector: 'app-owner-state-message',
  imports: [CommonModule],
  template: `
    <section class="state-message" [class]="'state-message tone-' + severity">
      @if (eyebrow) {
        <span class="state-message__eyebrow">{{ eyebrow }}</span>
      }
      <h2>{{ title }}</h2>
      @if (message) {
        <p>{{ message }}</p>
      }
      <div class="state-message__actions">
        <ng-content select="[state-action]"></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .state-message {
        display: grid;
        gap: 0.65rem;
        padding: 1.5rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-inline-start: 5px solid var(--trackora-border);
        border-radius: 1.15rem;
      }

      .state-message__eyebrow {
        color: var(--trackora-text-secondary);
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
      }

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--trackora-primary);
        font-size: 1.25rem;
      }

      p {
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }

      .state-message__actions {
        margin-block-start: 0.35rem;
      }

      .tone-success { border-inline-start-color: var(--trackora-success); }
      .tone-warning { border-inline-start-color: var(--trackora-warning); }
      .tone-danger { border-inline-start-color: var(--trackora-danger); }
      .tone-info { border-inline-start-color: var(--trackora-info); }
    `,
  ],
})
export class StateMessageComponent {
  @Input({ required: true }) title!: string;
  @Input() message = '';
  @Input() eyebrow = '';
  @Input() severity: DashboardSeverity = 'neutral';
}

@Component({
  selector: 'app-owner-loading-state',
  imports: [StateMessageComponent],
  template: `
    <app-owner-state-message
      [title]="title"
      [message]="message"
      [eyebrow]="eyebrow"
      severity="info"
    />
  `,
})
export class LoadingStateComponent {
  @Input() title = 'Loading dashboard data';
  @Input() message = 'Please wait while the latest operational state is prepared.';
  @Input() eyebrow = 'Loading';
}

@Component({
  selector: 'app-owner-empty-state',
  imports: [StateMessageComponent],
  template: `
    <app-owner-state-message [title]="title" [message]="message" [eyebrow]="eyebrow">
      <ng-content select="[state-action]"></ng-content>
    </app-owner-state-message>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'No records yet';
  @Input() message = 'There is no platform data matching the current view.';
  @Input() eyebrow = 'Empty state';
}

@Component({
  selector: 'app-owner-error-state',
  imports: [StateMessageComponent],
  template: `
    <app-owner-state-message
      [title]="title"
      [message]="message"
      [eyebrow]="eyebrow"
      severity="danger"
    >
      <ng-content select="[state-action]"></ng-content>
    </app-owner-state-message>
  `,
})
export class ErrorStateComponent {
  @Input() title = 'Unable to load data';
  @Input() message = 'Retry the request or check the current platform connection.';
  @Input() eyebrow = 'Error';
}

@Component({
  selector: 'app-owner-forbidden-state',
  imports: [StateMessageComponent],
  template: `
    <app-owner-state-message
      [title]="title"
      [message]="message"
      [eyebrow]="eyebrow"
      severity="warning"
    >
      <ng-content select="[state-action]"></ng-content>
    </app-owner-state-message>
  `,
})
export class ForbiddenStateComponent {
  @Input() title = 'Access forbidden';
  @Input() message = 'Your owner role does not include permission for this operation.';
  @Input() eyebrow = '403';
}

@Component({
  selector: 'app-owner-filter-bar',
  imports: [CommonModule],
  template: `
    <form class="filter-bar" (submit)="filterApply.emit()">
      <div class="filter-bar__search">
        <ng-content select="[filter-search]"></ng-content>
      </div>
      <div class="filter-bar__controls">
        <ng-content select="[filter-controls]"></ng-content>
      </div>
      <div class="filter-bar__actions">
        @if (showReset) {
          <button type="button" class="filter-bar__button" (click)="filterReset.emit()">
            {{ resetLabel }}
          </button>
        }
        @if (showApply) {
          <button type="submit" class="filter-bar__button filter-bar__button--primary">
            {{ applyLabel }}
          </button>
        }
      </div>
    </form>
  `,
  styles: [
    `
      .filter-bar {
        display: grid;
        grid-template-columns: minmax(16rem, 1.2fr) minmax(0, 2fr) auto;
        gap: 0.75rem;
        align-items: center;
        padding: 0.9rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1rem;
      }

      .filter-bar__controls,
      .filter-bar__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .filter-bar__actions {
        justify-content: flex-end;
      }

      .filter-bar__button {
        padding-block: 0.65rem;
        padding-inline: 0.9rem;
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 800;
      }

      .filter-bar__button--primary {
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border-color: var(--trackora-primary);
      }

      @media (max-width: 980px) {
        .filter-bar {
          grid-template-columns: 1fr;
        }

        .filter-bar__actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class FilterBarComponent {
  @Input() resetLabel = 'Reset';
  @Input() applyLabel = 'Apply';
  @Input() showReset = true;
  @Input() showApply = false;
  @Output() filterReset = new EventEmitter<void>();
  @Output() filterApply = new EventEmitter<void>();
}

@Component({
  selector: 'app-owner-data-table-shell',
  imports: [CommonModule, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent],
  template: `
    <section class="table-shell">
      <div class="table-shell__header">
        <ng-content select="[table-header]"></ng-content>
      </div>
      <div class="table-shell__filters">
        <ng-content select="[table-filters]"></ng-content>
      </div>
      @if (loading) {
        <app-owner-loading-state [title]="loadingTitle" [message]="loadingMessage" />
      } @else if (error) {
        <app-owner-error-state [title]="errorTitle" [message]="errorMessage">
          <ng-content select="[table-retry]"></ng-content>
        </app-owner-error-state>
      } @else if (empty) {
        <app-owner-empty-state [title]="emptyTitle" [message]="emptyMessage">
          <ng-content select="[table-empty-action]"></ng-content>
        </app-owner-empty-state>
      } @else {
        <div class="table-shell__scroll">
          <ng-content select="[table-content]"></ng-content>
        </div>
        <div class="table-shell__pagination">
          <ng-content select="[table-pagination]"></ng-content>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .table-shell {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1.15rem;
        box-shadow: 0 18px 45px color-mix(in srgb, var(--trackora-primary) 8%, transparent);
      }

      .table-shell__header:empty,
      .table-shell__filters:empty,
      .table-shell__pagination:empty {
        display: none;
      }

      .table-shell__scroll {
        min-inline-size: 0;
        overflow-x: auto;
        border: 1px solid var(--trackora-border);
        border-radius: 0.95rem;
      }

      .table-shell__pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
      }
    `,
  ],
})
export class DataTableShellComponent {
  @Input() loading = false;
  @Input() empty = false;
  @Input() error = false;
  @Input() loadingTitle = 'Loading table data';
  @Input() loadingMessage = 'Preparing the latest records.';
  @Input() emptyTitle = 'No records found';
  @Input() emptyMessage = 'Adjust filters or try another search.';
  @Input() errorTitle = 'Table unavailable';
  @Input() errorMessage = 'The records could not be loaded.';
}

@Component({
  selector: 'app-owner-confirmation-dialog',
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="dialog-backdrop" role="presentation">
        <section class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title">
          <div class="dialog__marker" [class]="'tone-' + severity"></div>
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <div class="dialog__actions">
            <button type="button" class="dialog__button" (click)="confirmationCancel.emit()">
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="dialog__button dialog__button--primary"
              [class]="'dialog__button dialog__button--primary tone-' + severity"
              (click)="confirmationConfirm.emit()"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: color-mix(in srgb, var(--trackora-primary) 40%, transparent);
      }

      .dialog {
        inline-size: min(34rem, 100%);
        padding: 1.25rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1.2rem;
        box-shadow: 0 24px 70px color-mix(in srgb, var(--trackora-primary) 18%, transparent);
      }

      .dialog__marker {
        inline-size: 3rem;
        block-size: 0.25rem;
        margin-block-end: 1rem;
        background: var(--trackora-border);
        border-radius: 999px;
      }

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--trackora-primary);
        font-size: 1.25rem;
      }

      p {
        margin-block-start: 0.6rem;
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }

      .dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
        margin-block-start: 1.25rem;
      }

      .dialog__button {
        padding-block: 0.7rem;
        padding-inline: 1rem;
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 800;
      }

      .dialog__button--primary {
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border-color: var(--trackora-primary);
      }

      .tone-success { background: var(--trackora-success); border-color: var(--trackora-success); }
      .tone-warning { background: var(--trackora-warning); border-color: var(--trackora-warning); }
      .tone-danger { background: var(--trackora-danger); border-color: var(--trackora-danger); }
      .tone-info { background: var(--trackora-info); border-color: var(--trackora-info); }
    `,
  ],
})
export class ConfirmationDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title!: string;
  @Input() message = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() severity: DashboardSeverity = 'neutral';
  @Output() confirmationConfirm = new EventEmitter<void>();
  @Output() confirmationCancel = new EventEmitter<void>();
}

@Component({
  selector: 'app-owner-reason-required-dialog',
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="dialog-backdrop" role="presentation">
        <section class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title">
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <label>
            <span>{{ reasonLabel }}</span>
            <textarea
              [(ngModel)]="reason"
              [attr.placeholder]="placeholder"
              rows="5"
            ></textarea>
          </label>
          @if (submitted && !trimmedReason) {
            <small>{{ requiredMessage }}</small>
          }
          <div class="dialog__actions">
            <button type="button" class="dialog__button" (click)="reasonCancel.emit()">
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="dialog__button dialog__button--primary"
              [disabled]="!trimmedReason"
              (click)="submitReason()"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: color-mix(in srgb, var(--trackora-primary) 40%, transparent);
      }

      .dialog {
        inline-size: min(38rem, 100%);
        padding: 1.25rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-block-start: 5px solid var(--trackora-warning);
        border-radius: 1.2rem;
      }

      h2,
      p {
        margin: 0;
      }

      p {
        margin-block-start: 0.55rem;
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }

      label {
        display: grid;
        gap: 0.45rem;
        margin-block-start: 1rem;
        color: var(--trackora-primary);
        font-weight: 800;
      }

      textarea {
        resize: vertical;
        min-block-size: 8rem;
        padding: 0.8rem;
        color: var(--trackora-text);
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.85rem;
        line-height: 1.6;
      }

      small {
        display: block;
        margin-block-start: 0.45rem;
        color: var(--trackora-danger);
      }

      .dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
        margin-block-start: 1.25rem;
      }

      .dialog__button {
        padding-block: 0.7rem;
        padding-inline: 1rem;
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 800;
      }

      .dialog__button--primary {
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border-color: var(--trackora-primary);
      }

      .dialog__button:disabled {
        cursor: not-allowed;
        opacity: 0.58;
      }
    `,
  ],
})
export class ReasonRequiredDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title!: string;
  @Input() message = '';
  @Input() reasonLabel = 'Reason';
  @Input() placeholder = 'Write the operational reason for this action.';
  @Input() requiredMessage = 'Reason is required.';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Output() reasonConfirm = new EventEmitter<string>();
  @Output() reasonCancel = new EventEmitter<void>();

  reason = '';
  submitted = false;

  get trimmedReason(): string {
    return this.reason.trim();
  }

  submitReason(): void {
    this.submitted = true;
    if (!this.trimmedReason) {
      return;
    }
    this.reasonConfirm.emit(this.trimmedReason);
  }
}

@Component({
  selector: 'app-owner-side-panel',
  imports: [CommonModule],
  template: `
    @if (open) {
      <aside class="side-panel" role="dialog" aria-modal="true" [attr.aria-label]="title">
        <header>
          <div>
            <h2>{{ title }}</h2>
            @if (description) {
              <p>{{ description }}</p>
            }
          </div>
          <button type="button" (click)="closed.emit()">{{ closeLabel }}</button>
        </header>
        <div class="side-panel__content">
          <ng-content></ng-content>
        </div>
      </aside>
    }
  `,
  styles: [
    `
      .side-panel {
        position: fixed;
        inset-block: 0;
        inset-inline-end: 0;
        z-index: 35;
        display: grid;
        grid-template-rows: auto 1fr;
        inline-size: min(31rem, 100%);
        background: var(--trackora-bg);
        border-inline-start: 1px solid var(--trackora-border);
        box-shadow: -24px 0 60px color-mix(in srgb, var(--trackora-primary) 14%, transparent);
      }

      header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.15rem;
        border-block-end: 1px solid var(--trackora-border);
      }

      h2,
      p {
        margin: 0;
      }

      p {
        margin-block-start: 0.35rem;
        color: var(--trackora-text-secondary);
        line-height: 1.6;
      }

      button {
        align-self: flex-start;
        padding-block: 0.55rem;
        padding-inline: 0.8rem;
        color: var(--trackora-primary);
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.7rem;
        cursor: pointer;
        font-weight: 800;
      }

      .side-panel__content {
        min-block-size: 0;
        overflow: auto;
        padding: 1.15rem;
      }
    `,
  ],
})
export class SidePanelComponent {
  @Input() open = false;
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() closeLabel = 'Close';
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'app-owner-section-card',
  imports: [CommonModule],
  template: `
    <section class="section-card">
      <header>
        <div>
          <h2>{{ title }}</h2>
          @if (description) {
            <p>{{ description }}</p>
          }
        </div>
        <div class="section-card__actions">
          <ng-content select="[section-actions]"></ng-content>
        </div>
      </header>
      <div class="section-card__body">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .section-card {
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 1.15rem;
      }

      header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1rem 0;
      }

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--trackora-primary);
        font-size: 1.05rem;
      }

      p {
        margin-block-start: 0.35rem;
        color: var(--trackora-text-secondary);
        line-height: 1.6;
      }

      .section-card__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .section-card__body {
        padding: 1rem;
      }
    `,
  ],
})
export class SectionCardComponent {
  @Input({ required: true }) title!: string;
  @Input() description = '';
}

@Component({
  selector: 'app-owner-metric-grid',
  template: `
    <div class="metric-grid">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
        gap: 1rem;
      }
    `,
  ],
})
export class MetricGridComponent {}

@Component({
  selector: 'app-owner-action-menu',
  imports: [CommonModule],
  template: `
    <div class="action-menu">
      <button type="button" class="action-menu__trigger" (click)="toggle()">
        {{ label }}
      </button>
      @if (open) {
        <div class="action-menu__panel" role="menu">
          @for (item of items; track item.label) {
            <button
              type="button"
              role="menuitem"
              [disabled]="item.disabled"
              [class]="'action-menu__item tone-' + (item.severity || 'neutral')"
              (click)="selectItem(item)"
            >
              {{ item.label }}
            </button>
          }
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .action-menu {
        position: relative;
        display: inline-block;
      }

      .action-menu__trigger,
      .action-menu__item {
        padding-block: 0.62rem;
        padding-inline: 0.85rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        cursor: pointer;
        font-weight: 800;
      }

      .action-menu__trigger {
        color: var(--trackora-primary);
        border-radius: 0.75rem;
      }

      .action-menu__panel {
        position: absolute;
        inset-block-start: calc(100% + 0.45rem);
        inset-inline-end: 0;
        z-index: 20;
        display: grid;
        min-inline-size: 12rem;
        padding: 0.35rem;
        background: var(--trackora-bg);
        border: 1px solid var(--trackora-border);
        border-radius: 0.85rem;
        box-shadow: 0 18px 45px color-mix(in srgb, var(--trackora-primary) 12%, transparent);
      }

      .action-menu__item {
        inline-size: 100%;
        color: var(--trackora-text);
        text-align: start;
        border-color: transparent;
        border-radius: 0.6rem;
      }

      .action-menu__item:hover {
        background: var(--trackora-surface);
      }

      .action-menu__item:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .tone-danger { color: var(--trackora-danger); }
      .tone-warning { color: var(--trackora-warning); }
      .tone-success { color: var(--trackora-success); }
      .tone-info { color: var(--trackora-info); }
    `,
  ],
})
export class ActionMenuComponent {
  @Input() label = 'Actions';
  @Input() items: ActionMenuItem[] = [];
  @Output() selected = new EventEmitter<ActionMenuItem>();

  open = false;

  toggle(): void {
    this.open = !this.open;
  }

  selectItem(item: ActionMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.selected.emit(item);
    this.open = false;
  }
}
