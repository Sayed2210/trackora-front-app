import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CourierRepository } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';

interface Courier {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  zone: string;
  currentTasks: number;
  capacity: number;
  rating: number;
  joinedAt: string;
}

@Component({
  selector: 'app-courier-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="courier-management">
      <div class="page-header">
        <h1>Courier Management</h1>
        <button class="p-button p-button-primary">+ Add Courier</button>
      </div>

      <div class="filters-bar">
        <input type="text" placeholder="Search couriers..." class="search-input" />
        <select class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select class="filter-select">
          <option value="">All Zones</option>
          <option value="cairo">Cairo</option>
          <option value="alexandria">Alexandria</option>
          <option value="giza">Giza</option>
        </select>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Zone</th>
            <th>Status</th>
            <th>Tasks</th>
            <th>Capacity</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let courier of couriers(); trackBy: trackByCourierId">
            <td>
              <div class="courier-name">
                <span class="avatar">{{ courier.name.charAt(0) }}</span>
                <span>{{ courier.name }}</span>
              </div>
            </td>
            <td>
              <div class="contact">
                <span>{{ courier.phone }}</span>
                <small>{{ courier.email }}</small>
              </div>
            </td>
            <td>{{ courier.zone }}</td>
            <td>
              <span class="status-badge" [class]="courier.status">{{ courier.status }}</span>
            </td>
            <td>{{ courier.currentTasks }}</td>
            <td>
              <div class="capacity-bar">
                <div class="capacity-fill" [style.width.%]="(courier.currentTasks / courier.capacity) * 100"></div>
              </div>
              <small>{{ courier.currentTasks }}/{{ courier.capacity }}</small>
            </td>
            <td>
              <span class="rating">⭐ {{ courier.rating }}</span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn" (click)="toggleStatus(courier)">
                  {{ courier.status === 'active' ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .courier-management { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .p-button-primary { padding: 0.625rem 1.25rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .filters-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .search-input { flex: 1; padding: 0.625rem 1rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; }
    .filter-select { padding: 0.625rem 1rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; background: white; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid var(--trackora-border); border-radius: 8px; overflow: hidden; }
    .data-table th, .data-table td { padding: 0.875rem 1rem; text-align: start; border-bottom: 1px solid var(--trackora-border); font-size: 0.875rem; }
    .data-table th { background: var(--trackora-surface); font-weight: 600; color: var(--trackora-text-secondary); }
    .courier-name { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--trackora-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; }
    .contact { display: flex; flex-direction: column; }
    .contact small { color: var(--trackora-text-secondary); font-size: 0.75rem; }
    .status-badge { padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .active { background: #D1FAE5; color: #065F46; }
    .inactive { background: #F3F4F6; color: #4B5563; }
    .suspended { background: #FEE2E2; color: #991B1B; }
    .capacity-bar { width: 80px; height: 6px; background: var(--trackora-border); border-radius: 3px; overflow: hidden; margin-bottom: 0.25rem; }
    .capacity-fill { height: 100%; background: var(--trackora-primary); border-radius: 3px; }
    .rating { font-size: 0.875rem; }
    .actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.375rem 0.75rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
  `],
})
export class CourierManagementPageComponent implements OnInit {
  private readonly courierRepo = inject(CourierRepository);

  readonly couriers = signal<Courier[]>([]);

  ngOnInit(): void {
    this.loadCouriers();
  }

  private async loadCouriers(): Promise<void> {
    try {
      const tasks = await firstValueFrom(this.courierRepo.getTasks());
      this.couriers.set(tasks as Courier[]);
    } catch {
      // Keep empty list on error
      this.couriers.set([]);
    }
  }

  toggleStatus(courier: Courier): void {
    this.couriers.update((list) =>
      list.map((c) =>
        c.id === courier.id
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' as Courier['status'] }
          : c
      )
    );
  }

  trackByCourierId(_index: number, courier: Courier): string {
    return courier.id;
  }
}
