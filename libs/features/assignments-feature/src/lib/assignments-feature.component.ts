import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AssignmentRepository, CourierAdmin, CourierRepository, ShipmentRepository } from '@trackora/shared/data-access';
import { Shipment, ShipmentStatus } from '@trackora/shared/domain';
import { firstValueFrom } from 'rxjs';

interface Courier {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'on_delivery';
  currentLoad: number;
  maxCapacity: number;
  zone: string;
}

@Component({
  selector: 'app-assignments-feature',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="dispatch-board">
      <div class="board-header">
        <h1>Dispatch Board</h1>
        <div class="header-stats">
          <span class="stat">Unassigned: {{ unassignedShipments().length }}</span>
          <span class="stat">Active Couriers: {{ activeCouriers().length }}</span>
        </div>
      </div>

      <div class="board-panels">
        <div class="panel unassigned-panel">
          <div class="panel-header">
            <h3>Unassigned Shipments</h3>
            <div class="panel-filters">
              <select [value]="zoneFilter()" (change)="zoneFilter.set(($any($event.target).value))">
                <option value="">All Zones</option>
                <option *ngFor="let z of zones()" [value]="z">{{ z }}</option>
              </select>
              <select [value]="riskFilter()" (change)="riskFilter.set(($any($event.target).value))">
                <option value="">All Risk</option>
                <option value="high">High COD</option>
                <option value="medium">Medium COD</option>
                <option value="low">Low/No COD</option>
              </select>
            </div>
          </div>
          <div class="shipment-list">
            <div
              class="shipment-card"
              *ngFor="let s of filteredUnassigned()"
              [class.selected]="selectedShipment()?.id === s.id"
              (click)="selectShipment(s)"
            >
              <div class="card-header">
                <span class="tracking">{{ s.trackingNumber }}</span>
                <span class="cod-badge" [class.high]="(s.codAmount || 0) > 500" [class.medium]="(s.codAmount || 0) > 200 && (s.codAmount || 0) <= 500">
                  {{ s.codAmount ? (s.codAmount | number:'1.0-0') + ' EGP' : 'No COD' }}
                </span>
              </div>
              <div class="card-body">
                <div class="customer">{{ s.customerName }}</div>
                <div class="address">{{ s.address.city }}, {{ s.address.governorate }}</div>
                <div class="zone">Zone: {{ s.address.zone || 'N/A' }}</div>
              </div>
            </div>
            <div class="empty-state" *ngIf="!filteredUnassigned().length">
              <p>No unassigned shipments</p>
            </div>
          </div>
        </div>

        <div class="panel couriers-panel">
          <div class="panel-header">
            <h3>Active Couriers</h3>
          </div>
          <div class="courier-list">
            <div
              class="courier-card"
              *ngFor="let c of activeCouriers()"
              [class.selected]="selectedCourier()?.id === c.id"
              [class.disabled]="c.currentLoad >= c.maxCapacity"
              (click)="selectCourier(c)"
            >
              <div class="courier-info">
                <div class="courier-name">
                  <span class="status-dot" [class]="c.status"></span>
                  {{ c.name }}
                </div>
                <div class="courier-zone">{{ c.zone }}</div>
              </div>
              <div class="capacity-bar">
                <div class="capacity-track">
                  <div
                    class="capacity-fill"
                    [style.width.%]="(c.currentLoad / c.maxCapacity) * 100"
                    [class.high]="c.currentLoad / c.maxCapacity > 0.8"
                  ></div>
                </div>
                <span class="capacity-text">{{ c.currentLoad }}/{{ c.maxCapacity }}</span>
              </div>
              <button
                class="assign-btn"
                *ngIf="selectedShipment() && selectedCourier()?.id === c.id"
                (click)="assignShipment($event)"
                [disabled]="c.currentLoad >= c.maxCapacity"
              >
                Assign
              </button>
            </div>
            <div class="empty-state" *ngIf="!activeCouriers().length">
              <p>No active couriers</p>
            </div>
          </div>
        </div>
      </div>

      <div class="assignment-log" *ngIf="recentAssignments().length > 0">
        <h3>Recent Assignments</h3>
        <div class="log-item" *ngFor="let log of recentAssignments()">
          <span class="log-shipment">{{ log.shipmentId }}</span>
          <span class="arrow">→</span>
          <span class="log-courier">{{ log.courierName }}</span>
          <span class="log-time">{{ log.time | date:'shortTime' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dispatch-board { padding: 1rem; }
    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .board-header h1 { margin: 0; font-size: 1.5rem; }
    .header-stats { display: flex; gap: 1rem; }
    .stat { background: var(--trackora-surface); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; }
    .board-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    @media (max-width: 968px) { .board-panels { grid-template-columns: 1fr; } }
    .panel { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
    .panel-header h3 { margin: 0; font-size: 1rem; }
    .panel-filters { display: flex; gap: 0.5rem; }
    .panel-filters select { padding: 0.375rem 0.5rem; border: 1px solid var(--trackora-border); border-radius: 6px; font-size: 0.875rem; }
    .shipment-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 600px; overflow-y: auto; }
    .shipment-card { border: 2px solid var(--trackora-border); border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.2s; }
    .shipment-card:hover { border-color: var(--trackora-primary); }
    .shipment-card.selected { border-color: var(--trackora-primary); background: #EFF6FF; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .tracking { font-weight: 700; color: var(--trackora-primary); font-size: 0.875rem; }
    .cod-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; background: var(--trackora-surface); font-weight: 600; }
    .cod-badge.high { background: #FEE2E2; color: #991B1B; }
    .cod-badge.medium { background: #FEF3C7; color: #92400E; }
    .card-body { font-size: 0.875rem; }
    .customer { font-weight: 600; margin-bottom: 0.25rem; }
    .address { color: var(--trackora-text-secondary); margin-bottom: 0.25rem; }
    .zone { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .courier-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 600px; overflow-y: auto; }
    .courier-card { border: 2px solid var(--trackora-border); border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.2s; }
    .courier-card:hover { border-color: var(--trackora-primary); }
    .courier-card.selected { border-color: var(--trackora-primary); background: #EFF6FF; }
    .courier-card.disabled { opacity: 0.5; cursor: not-allowed; }
    .courier-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .courier-name { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.online { background: #10B981; }
    .status-dot.offline { background: #9CA3AF; }
    .status-dot.on_delivery { background: #3B82F6; }
    .courier-zone { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .capacity-bar { display: flex; align-items: center; gap: 0.5rem; }
    .capacity-track { flex: 1; height: 8px; background: var(--trackora-surface); border-radius: 4px; overflow: hidden; }
    .capacity-fill { height: 100%; background: #10B981; border-radius: 4px; transition: width 0.3s ease; }
    .capacity-fill.high { background: #EF4444; }
    .capacity-text { font-size: 0.75rem; color: var(--trackora-text-secondary); min-width: 3rem; text-align: right; }
    .assign-btn { margin-top: 0.75rem; width: 100%; padding: 0.5rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .assign-btn:disabled { background: #9CA3AF; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); font-size: 0.875rem; }
    .assignment-log { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .assignment-log h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .log-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--trackora-border); font-size: 0.875rem; }
    .log-item:last-child { border-bottom: none; }
    .log-shipment { font-weight: 600; color: var(--trackora-primary); }
    .arrow { color: var(--trackora-text-secondary); }
    .log-courier { font-weight: 500; }
    .log-time { margin-left: auto; font-size: 0.75rem; color: var(--trackora-text-secondary); }
  `],
})
export class AssignmentsFeatureComponent implements OnInit {
  private readonly shipmentRepo = inject(ShipmentRepository);
  private readonly courierRepo = inject(CourierRepository);
  private readonly assignmentRepo = inject(AssignmentRepository);

  readonly unassignedShipments = signal<Shipment[]>([]);
  readonly activeCouriers = signal<Courier[]>([]);
  readonly selectedShipment = signal<Shipment | null>(null);
  readonly selectedCourier = signal<Courier | null>(null);
  readonly zoneFilter = signal('');
  readonly riskFilter = signal('');
  readonly recentAssignments = signal<Array<{ shipmentId: string; courierName: string; time: Date }>>([]);
  readonly zones = signal<string[]>([]);

  readonly filteredUnassigned = () => {
    let list = this.unassignedShipments();
    if (this.zoneFilter()) {
      list = list.filter((s) => s.address.zone === this.zoneFilter());
    }
    if (this.riskFilter()) {
      const amount = this.riskFilter();
      list = list.filter((s) => {
        const cod = s.codAmount || 0;
        if (amount === 'high') return cod > 500;
        if (amount === 'medium') return cod > 200 && cod <= 500;
        return cod <= 200;
      });
    }
    return list;
  };

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const result = await firstValueFrom(this.shipmentRepo.findAll({ page: 1, limit: 100 }));
      const shipments = result.data;
      const unassigned = shipments.filter((s) => !s.assignedCourierId && s.status === ShipmentStatus.PENDING);
      this.unassignedShipments.set(unassigned);

      const uniqueZones = Array.from(new Set(shipments.map((s) => s.address.zone).filter(Boolean))) as string[];
      this.zones.set(uniqueZones);
    } catch {
      this.unassignedShipments.set([]);
      this.zones.set([]);
    }

    try {
      const data = await firstValueFrom(this.courierRepo.findAll({ isActive: true, isAvailable: true, page: 1, limit: 100 }));
      const items = Array.isArray(data) ? data : data?.data ?? [];
      this.activeCouriers.set(items.map((courier: CourierAdmin) => this.toDispatchCourier(courier)));
    } catch {
      this.activeCouriers.set([]);
    }
  }

  selectShipment(shipment: Shipment): void {
    this.selectedShipment.set(shipment);
  }

  selectCourier(courier: Courier): void {
    if (courier.currentLoad >= courier.maxCapacity) return;
    this.selectedCourier.set(courier);
  }

  async assignShipment(event: Event): Promise<void> {
    event.stopPropagation();
    const shipment = this.selectedShipment();
    const courier = this.selectedCourier();
    if (!shipment || !courier) return;

    await firstValueFrom(this.assignmentRepo.create({
      shipmentIds: [shipment.id],
      courierId: courier.id,
    }));

    this.unassignedShipments.update((list) => list.filter((s) => s.id !== shipment.id));
    this.activeCouriers.update((list) =>
      list.map((c) => (c.id === courier.id ? { ...c, currentLoad: c.currentLoad + 1 } : c))
    );

    this.recentAssignments.update((logs) => [
      { shipmentId: shipment.trackingNumber, courierName: courier.name, time: new Date() },
      ...logs,
    ].slice(0, 10));

    this.selectedShipment.set(null);
    this.selectedCourier.set(null);
  }

  private toDispatchCourier(courier: CourierAdmin): Courier {
    return {
      id: courier.id,
      name: courier.name,
      status: courier.isAvailable ? 'online' : 'offline',
      currentLoad: courier.currentTasks ?? courier.activeTasks ?? 0,
      maxCapacity: courier.capacity ?? courier.maxDailyCapacity ?? 1,
      zone: courier.zoneCodes?.join(', ') || 'N/A',
    };
  }
}
