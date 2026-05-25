import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DashboardSeverity = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export interface ActionMenuItem { label: string; disabled?: boolean; severity?: DashboardSeverity }

@Component({
  selector: 'app-owner-page-header',
  imports: [CommonModule],
  template: `<header class="page-header"><nav>@for (breadcrumb of breadcrumbs; track breadcrumb.label) { <span>{{ breadcrumb.label }}</span> }</nav><div><section><h1>{{ title }}</h1><p>{{ description }}</p></section><aside><ng-content select="[page-actions]" /></aside></div></header>`,
  styles: [` .page-header { display: grid; gap: .75rem; } nav { display: flex; gap: .45rem; color: var(--trackora-text-secondary); font-size: .82rem; } nav span:not(:last-child)::after { content: '/'; margin-inline: .45rem; color: var(--trackora-border); } div { display: flex; justify-content: space-between; gap: 1rem; align-items: end; } h1, p { margin: 0; } h1 { color: var(--trackora-primary); font-size: clamp(1.8rem, 4vw, 3rem); } p { margin-block-start: .45rem; color: var(--trackora-text-secondary); line-height: 1.7; } aside { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .6rem; } @media(max-width:760px){ div { flex-direction: column; align-items: stretch; } aside { justify-content: flex-start; } } `],
})
export class PageHeaderComponent { @Input({ required: true }) title!: string; @Input() description = ''; @Input() breadcrumbs: { label: string; href?: string }[] = []; }

@Component({
  selector: 'app-owner-status-badge',
  imports: [CommonModule],
  template: `<span class="badge" [class]="'badge tone-' + status">{{ label || status }}</span>`,
  styles: [` .badge { display: inline-flex; width: fit-content; padding: .32rem .62rem; border: 1px solid var(--trackora-border); border-radius: 999px; color: var(--trackora-text-secondary); background: var(--trackora-surface); font-size: .78rem; font-weight: 900; } .tone-success { color: var(--trackora-success); } .tone-warning { color: var(--trackora-warning); } .tone-danger { color: var(--trackora-danger); } .tone-info { color: var(--trackora-info); } `],
})
export class StatusBadgeComponent { @Input({ required: true }) status!: string; @Input() label = ''; }

@Component({
  selector: 'app-owner-stat-card',
  template: `<article><p>{{ title }}</p><strong>{{ empty ? emptyLabel : value }}</strong><small>{{ subtitle }}</small></article>`,
  styles: [` article { display: grid; gap: .4rem; min-block-size: 7rem; padding: 1rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-block-start: 4px solid var(--trackora-border); border-radius: 1rem; } p, small { margin: 0; color: var(--trackora-text-secondary); } strong { color: var(--trackora-primary); font-family: var(--font-header); font-size: 1.7rem; } `],
})
export class StatCardComponent { @Input({ required: true }) title!: string; @Input() value: string | number | null | undefined; @Input() subtitle = ''; @Input() severity: DashboardSeverity = 'neutral'; @Input() loading = false; @Input() empty = false; @Input() emptyLabel = 'No data'; }

@Component({ selector: 'app-owner-metric-grid', template: `<div><ng-content /></div>`, styles: [` div { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr)); gap: 1rem; } `] })
export class MetricGridComponent {}

@Component({
  selector: 'app-owner-section-card',
  template: `<section><header><div><h2>{{ title }}</h2><p>{{ description }}</p></div><aside><ng-content select="[section-actions]" /></aside></header><main><ng-content /></main></section>`,
  styles: [` section { background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; } header { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 1rem 0; } h2, p { margin: 0; } h2 { color: var(--trackora-primary); } p { margin-block-start: .35rem; color: var(--trackora-text-secondary); } main { padding: 1rem; } `],
})
export class SectionCardComponent { @Input({ required: true }) title!: string; @Input() description = ''; }

@Component({ selector: 'app-owner-loading-state', template: `<section class="state"><h2>{{ title }}</h2><p>{{ message }}</p></section>`, styles: [` .state { padding: 1.5rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-inline-start: 5px solid var(--trackora-info); border-radius: 1rem; } h2, p { margin: 0; } h2 { color: var(--trackora-primary); } p { margin-block-start: .45rem; color: var(--trackora-text-secondary); } `] })
export class LoadingStateComponent { @Input() title = 'Loading'; @Input() message = 'Please wait.'; }

@Component({ selector: 'app-owner-empty-state', template: `<section class="state"><h2>{{ title }}</h2><p>{{ message }}</p><ng-content select="[state-action]" /></section>`, styles: [` .state { padding: 1.5rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; } h2, p { margin: 0; } h2 { color: var(--trackora-primary); } p { margin-block: .45rem; color: var(--trackora-text-secondary); } `] })
export class EmptyStateComponent { @Input() title = 'No records found'; @Input() message = ''; }

@Component({ selector: 'app-owner-error-state', template: `<section class="state error"><h2>{{ title }}</h2><p>{{ message }}</p><ng-content select="[state-action]" /></section>`, styles: [` .state { padding: 1.5rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-inline-start: 5px solid var(--trackora-danger); border-radius: 1rem; } h2, p { margin: 0; } h2 { color: var(--trackora-primary); } p { margin-block: .45rem; color: var(--trackora-text-secondary); } `] })
export class ErrorStateComponent { @Input() title = 'Unable to load data'; @Input() message = ''; }

@Component({
  selector: 'app-owner-filter-bar',
  template: `<form class="filters" (submit)="$event.preventDefault(); filterApply.emit()"><ng-content select="[filter-search]" /><ng-content select="[filter-controls]" />@if (showReset) { <button type="button" (click)="filterReset.emit()">{{ resetLabel }}</button> }@if (showApply) { <button type="submit">{{ applyLabel }}</button> }</form>`,
  styles: [` .filters { display: flex; flex-wrap: wrap; gap: .7rem; padding: .9rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; } button { padding: .65rem .9rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: .75rem; font-weight: 800; } `],
})
export class FilterBarComponent { @Input() resetLabel = 'Reset'; @Input() applyLabel = 'Apply'; @Input() showReset = true; @Input() showApply = false; @Output() filterReset = new EventEmitter<void>(); @Output() filterApply = new EventEmitter<void>(); }

@Component({
  selector: 'app-owner-data-table-shell',
  imports: [LoadingStateComponent, EmptyStateComponent, ErrorStateComponent],
  template: `<section class="shell"><ng-content select="[table-filters]" />@if (loading) { <app-owner-loading-state [title]="loadingTitle" [message]="loadingMessage" /> } @else if (error) { <app-owner-error-state [title]="errorTitle" [message]="errorMessage"><ng-content select="[table-retry]" /></app-owner-error-state> } @else if (empty) { <app-owner-empty-state [title]="emptyTitle" [message]="emptyMessage"><ng-content select="[table-empty-action]" /></app-owner-empty-state> } @else { <ng-content select="[table-content]" /> }</section>`,
  styles: [` .shell { display: grid; gap: 1rem; padding: 1rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; } `],
})
export class DataTableShellComponent { @Input() loading = false; @Input() empty = false; @Input() error = false; @Input() loadingTitle = 'Loading table data'; @Input() loadingMessage = 'Preparing records.'; @Input() emptyTitle = 'No records found'; @Input() emptyMessage = ''; @Input() errorTitle = 'Table unavailable'; @Input() errorMessage = ''; }

@Component({
  selector: 'app-owner-confirmation-dialog',
  template: `@if (open) { <div class="backdrop"><section role="dialog"><h2>{{ title }}</h2><p>{{ message }}</p><footer><button type="button" (click)="confirmationCancel.emit()">{{ cancelLabel }}</button><button type="button" class="danger" (click)="confirmationConfirm.emit()">{{ confirmLabel }}</button></footer></section></div> }`,
  styles: [` .backdrop { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center; padding: 1rem; background: color-mix(in srgb, var(--trackora-primary) 40%, transparent); } section { inline-size: min(34rem, 100%); padding: 1.25rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; } h2, p { margin: 0; } h2 { color: var(--trackora-primary); } p { margin-block-start: .6rem; color: var(--trackora-text-secondary); } footer { display: flex; justify-content: flex-end; gap: .6rem; margin-block-start: 1rem; } button { padding: .7rem 1rem; border: 1px solid var(--trackora-border); border-radius: .75rem; font-weight: 800; } .danger { color: var(--trackora-primary-contrast); background: var(--trackora-danger); border-color: var(--trackora-danger); } `],
})
export class ConfirmationDialogComponent { @Input() open = false; @Input({ required: true }) title!: string; @Input() message = ''; @Input() confirmLabel = 'Confirm'; @Input() cancelLabel = 'Cancel'; @Input() severity: DashboardSeverity = 'neutral'; @Output() confirmationConfirm = new EventEmitter<void>(); @Output() confirmationCancel = new EventEmitter<void>(); }

@Component({
  selector: 'app-owner-action-menu',
  template: `<div><button type="button" (click)="open = !open">Actions</button>@if (open) { <menu>@for (item of items; track item.label) { <button type="button" [disabled]="item.disabled" (click)="select(item)">{{ item.label }}</button> }</menu> }</div>`,
  styles: [` div { position: relative; } button { padding: .62rem .85rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: .75rem; font-weight: 800; } menu { position: absolute; inset-block-start: 100%; inset-inline-end: 0; z-index: 20; display: grid; gap: .25rem; min-inline-size: 10rem; padding: .35rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: .85rem; } `],
})
export class ActionMenuComponent { @Input() items: ActionMenuItem[] = []; @Output() selected = new EventEmitter<ActionMenuItem>(); open = false; select(item: ActionMenuItem): void { if (!item.disabled) this.selected.emit(item); this.open = false; } }
