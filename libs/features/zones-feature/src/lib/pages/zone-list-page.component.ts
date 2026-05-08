import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ZoneFacade } from '../facade/zone.facade';
import { LoadingSpinnerComponent } from '@trackora/shared/ui';
import { ZoneLevelLabels } from '@trackora/shared/domain';

@Component({
  selector: 'app-zone-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LoadingSpinnerComponent],
  providers: [ZoneFacade],
  template: `
    <div class="zone-list">
      <div class="header">
        <h1>{{ 'zones.listTitle' | translate }}</h1>
        <button class="p-button p-button-primary" (click)="showCreate = true">
          + {{ 'zones.create' | translate }}
        </button>
      </div>

      <div class="filters">
        <input
          type="text"
          [placeholder]="'zones.search' | translate"
          (input)="onSearch($event)"
          class="search-input"
        />
        <select (change)="onLevelChange($event)">
          <option value="">{{ 'zones.allLevels' | translate }}</option>
          <option *ngFor="let level of levels" [value]="level">{{ levelLabels[level] }}</option>
        </select>
      </div>

      <app-loading-spinner *ngIf="facade.loading()" />

      <div class="error" *ngIf="facade.error()">
        {{ facade.error() }}
        <button (click)="facade.clearError()">Dismiss</button>
      </div>

      <table class="data-table" *ngIf="!facade.loading()">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name (AR)</th>
            <th>Name (EN)</th>
            <th>Level</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let zone of facade.zones()">
            <td><code>{{ zone.code }}</code></td>
            <td>{{ zone.nameAr }}</td>
            <td>{{ zone.nameEn || '-' }}</td>
            <td>{{ levelLabels[zone.level] }}</td>
            <td>
              <span class="status-badge" [class.active]="zone.isActive" [class.inactive]="!zone.isActive">
                {{ zone.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn" (click)="editZone(zone)">Edit</button>
                <button class="action-btn danger" (click)="deleteZone(zone.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Create Modal -->
      <div class="modal-overlay" *ngIf="showCreate" (click)="showCreate = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Create Zone</h2>
          <form (submit)="onCreate($event)">
            <div class="field">
              <label>Code</label>
              <input name="code" required />
            </div>
            <div class="field">
              <label>Name (AR)</label>
              <input name="nameAr" required />
            </div>
            <div class="field">
              <label>Name (EN)</label>
              <input name="nameEn" />
            </div>
            <div class="field">
              <label>Level</label>
              <select name="level" required>
                <option *ngFor="let level of levels" [value]="level">{{ levelLabels[level] }}</option>
              </select>
            </div>
            <div class="field">
              <label>Parent Zone ID (optional)</label>
              <input name="parentId" />
            </div>
            <div class="modal-actions">
              <button type="button" class="p-button-secondary" (click)="showCreate = false">Cancel</button>
              <button type="submit" class="p-button-primary">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .zone-list { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .search-input { flex: 1; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 4px; }
    .data-table { width: 100%; border-collapse: collapse; background: white; }
    .data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); text-align: start; }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.active { background: #D1FAE5; color: #065F46; }
    .status-badge.inactive { background: #F3F4F6; color: #4B5563; }
    .actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.25rem 0.5rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .action-btn.danger { color: #991B1B; border-color: #FECACA; }
    .action-btn.danger:hover { background: #FEE2E2; }
    .error { background: #FEE2E2; color: #991B1B; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: white; padding: 1.5rem; border-radius: 8px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .field { margin-bottom: 0.75rem; }
    .field label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.875rem; }
    .field input, .field select { width: 100%; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 4px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
    .p-button-primary { padding: 0.5rem 1rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .p-button-secondary { padding: 0.5rem 1rem; background: white; color: var(--trackora-text); border: 1px solid var(--trackora-border); border-radius: 4px; cursor: pointer; }
  `],
})
export class ZoneListPageComponent implements OnInit {
  readonly facade = inject(ZoneFacade);
  readonly levelLabels = ZoneLevelLabels;
  readonly levels = ['COUNTRY', 'GOVERNORATE', 'CITY', 'DISTRICT'] as const;
  showCreate = false;

  ngOnInit(): void {
    this.facade.loadZones();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.facade.loadZones({ search: value || undefined });
  }

  onLevelChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.facade.loadZones({ level: value as any || undefined });
  }

  async onCreate(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const fd = new FormData(form);
    const parentId = fd.get('parentId') as string;
    await this.facade.createZone({
      code: fd.get('code') as string,
      nameAr: fd.get('nameAr') as string,
      nameEn: (fd.get('nameEn') as string) || undefined,
      level: fd.get('level') as string,
      parentId: parentId || undefined,
    });
    this.showCreate = false;
    form.reset();
  }

  editZone(zone: any): void {
    // TODO: open edit modal
  }

  async deleteZone(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    await this.facade.deleteZone(id);
  }
}
