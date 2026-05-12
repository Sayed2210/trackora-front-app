import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CourierAdmin, CourierRepository } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';

interface Courier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  zone: string;
  currentTasks: number;
  capacity: number;
  rating: number;
  isAvailable?: boolean;
  joinedAt?: string;
}

@Component({
  selector: 'app-courier-management-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="courier-management">
      <div class="page-header">
        <h1>Courier Management</h1>
        <button class="p-button p-button-primary" (click)="openCreateForm()">+ Add Courier</button>
      </div>

      @if (showCreateForm()) {
        <form class="create-form" [formGroup]="createForm" (ngSubmit)="createCourier()">
          <div class="field">
            <label for="courier-name">Name</label>
            <input id="courier-name" formControlName="name" />
          </div>
          <div class="field">
            <label for="courier-phone">Phone</label>
            <input id="courier-phone" formControlName="phone" />
          </div>
          <div class="field">
            <label for="courier-email">Email</label>
            <input id="courier-email" type="email" formControlName="email" />
          </div>
          <div class="field">
            <label for="courier-zone-codes">Zone Codes</label>
            <input id="courier-zone-codes" formControlName="zoneCodes" placeholder="EG-C-MAD, EG-G-DOK" />
          </div>
          <div class="field">
            <label for="courier-capacity">Daily Capacity</label>
            <input id="courier-capacity" type="number" min="1" formControlName="maxDailyCapacity" />
          </div>
          <div class="field">
            <label for="courier-vehicle-type">Vehicle Type</label>
            <select id="courier-vehicle-type" formControlName="vehicleType">
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="CAR">Car</option>
              <option value="VAN">Van</option>
              <option value="BICYCLE">Bicycle</option>
            </select>
          </div>
          <div class="field">
            <label for="courier-license-plate">License Plate</label>
            <input id="courier-license-plate" formControlName="licensePlate" />
          </div>
          <div class="form-actions">
            <button type="submit" class="p-button p-button-primary" [disabled]="createForm.invalid || creating()">
              {{ creating() ? 'Adding...' : 'Save Courier' }}
            </button>
            <button type="button" class="action-btn" (click)="cancelCreateForm()" [disabled]="creating()">Cancel</button>
          </div>
          @if (createError()) {
            <p class="error-message">{{ createError() }}</p>
          }
        </form>
      }

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
                <small>{{ courier.email || 'N/A' }}</small>
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
                <button class="action-btn" (click)="toggleAvailability(courier)">
                  {{ courier.isAvailable ? 'Set Offline' : 'Set Available' }}
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
    .create-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; padding: 1rem; margin-bottom: 1.5rem; background: white; border: 1px solid var(--trackora-border); border-radius: 8px; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field label { font-size: 0.75rem; font-weight: 600; color: var(--trackora-text-secondary); }
    .field input, .field select { padding: 0.625rem 0.75rem; border: 1px solid var(--trackora-border); border-radius: 6px; font-size: 0.875rem; }
    .form-actions { display: flex; align-items: end; gap: 0.5rem; }
    .error-message { grid-column: 1 / -1; margin: 0; color: var(--trackora-danger); font-size: 0.875rem; }
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
  private readonly fb = inject(FormBuilder);

  readonly couriers = signal<Courier[]>([]);
  readonly showCreateForm = signal(false);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  readonly createForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    email: ['', Validators.email],
    zoneCodes: [''],
    maxDailyCapacity: [25, [Validators.required, Validators.min(1)]],
    vehicleType: ['MOTORCYCLE'],
    licensePlate: [''],
  });

  ngOnInit(): void {
    this.loadCouriers();
  }

  private async loadCouriers(): Promise<void> {
    try {
      const data = await firstValueFrom(this.courierRepo.findAll({ page: 1, limit: 50 }));
      const items = Array.isArray(data) ? data : data?.data ?? [];
      this.couriers.set(items.map((courier: CourierAdmin) => this.toCourierRow(courier)));
    } catch {
      this.couriers.set([]);
    }
  }

  openCreateForm(): void {
    this.createError.set(null);
    this.showCreateForm.set(true);
  }

  cancelCreateForm(): void {
    this.showCreateForm.set(false);
    this.createError.set(null);
    this.createForm.reset({
      name: '',
      phone: '',
      email: '',
      zoneCodes: '',
      maxDailyCapacity: 25,
      vehicleType: 'MOTORCYCLE',
      licensePlate: '',
    });
  }

  async createCourier(): Promise<void> {
    if (this.createForm.invalid) return;

    this.creating.set(true);
    this.createError.set(null);

    const value = this.createForm.getRawValue();
    const name = value.name ?? '';
    const phone = value.phone ?? '';
    const zoneCodes = (value.zoneCodes ?? '')
      .split(',')
      .map((zoneCode) => zoneCode.trim())
      .filter(Boolean);

    try {
      const courier = await firstValueFrom(this.courierRepo.create({
        name,
        phone,
        email: value.email || undefined,
        zoneCodes: zoneCodes.length ? zoneCodes : undefined,
        maxDailyCapacity: value.maxDailyCapacity ?? 25,
        vehicleType: value.vehicleType || undefined,
        licensePlate: value.licensePlate || undefined,
      }));

      this.couriers.update((list) => [this.toCourierRow(courier), ...list]);
      this.cancelCreateForm();
    } catch {
      this.createError.set('Could not add courier. Check the details and try again.');
    } finally {
      this.creating.set(false);
    }
  }

  async toggleAvailability(courier: Courier): Promise<void> {
    const nextAvailability = !courier.isAvailable;
    try {
      await firstValueFrom(this.courierRepo.updateAvailability(courier.id, nextAvailability));
      this.couriers.update((list) =>
        list.map((c) =>
          c.id === courier.id
            ? { ...c, isAvailable: nextAvailability, status: nextAvailability ? 'active' : 'inactive' }
            : c
        )
      );
    } catch {
      // In production show a toast
    }
  }

  trackByCourierId(_index: number, courier: Courier): string {
    return courier.id;
  }

  private toCourierRow(courier: CourierAdmin): Courier {
    const isActive = courier.isActive ?? (courier.status === 'active' || courier.status === 'online');
    const isAvailable = courier.isAvailable ?? courier.status === 'online';
    return {
      id: courier.id,
      name: courier.name,
      phone: courier.phone,
      email: courier.email,
      status: isActive ? 'active' : 'inactive',
      zone: courier.zoneCodes?.join(', ') || 'N/A',
      currentTasks: courier.currentTasks ?? courier.activeTasks ?? 0,
      capacity: courier.capacity ?? courier.maxDailyCapacity ?? 1,
      rating: courier.rating ?? 0,
      isAvailable,
      joinedAt: courier.createdAt,
    };
  }
}
