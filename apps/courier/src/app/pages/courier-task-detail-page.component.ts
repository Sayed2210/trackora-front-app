import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CourierRepository, CourierTask, UpdateTaskStatusDto } from '@trackora/shared/data-access';
import { courierDb, CachedTask } from '../services/offline-store.service';
import { OfflineSyncService } from '../services/offline-sync.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-courier-task-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-detail" *ngIf="task() as t">
      <div class="detail-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <span class="tracking-number">{{ t.trackingNumber }}</span>
        <span class="status-badge" [class]="t.status">{{ t.status }}</span>
      </div>

      <div class="customer-card">
        <h3>Customer</h3>
        <div class="info-row">
          <span class="label">Name</span>
          <span class="value">{{ t.customerName }}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone</span>
          <a [href]="'tel:' + t.customerPhone" class="value phone">{{ t.customerPhone }}</a>
        </div>
        <div class="info-row">
          <span class="label">Address</span>
          <span class="value">{{ t.address }}, {{ t.city }}, {{ t.governorate }}</span>
        </div>
      </div>

      <div class="cod-card" *ngIf="t.codAmount">
        <h3>COD Collection</h3>
        <div class="cod-amount">{{ t.codAmount }} EGP</div>
        <button class="confirm-cod-btn" (click)="confirmCod()" [disabled]="codConfirmed()">
          {{ codConfirmed() ? '✓ COD Confirmed' : 'Confirm COD Received' }}
        </button>
      </div>

      <div class="status-update">
        <h3>Update Status</h3>

        <div class="otp-section" *ngIf="showOtp()">
          <p>Enter 4-digit OTP from customer:</p>
          <div class="otp-inputs">
            <input
              *ngFor="let digit of otpDigits; let i = index"
              type="text"
              maxlength="1"
              [value]="otpValues()[i] || ''"
              (input)="onOtpInput($event, i)"
              class="otp-digit"
            />
          </div>
          <p class="otp-attempts" *ngIf="otpAttempts() > 0">Attempt {{ otpAttempts() }} of 3</p>
          <button class="verify-btn" (click)="verifyOtp()" [disabled]="!isOtpComplete()">Verify OTP</button>
        </div>

        <div class="photo-section">
          <p>Photo Evidence</p>
          <input type="file" accept="image/*" capture="environment" (change)="onPhotoCapture($event)" hidden #photoInput />
          <button class="action-btn" (click)="photoInput.click()">📷 Take Photo</button>
          <div class="photo-preview" *ngIf="capturedPhoto()">
            <img [src]="capturedPhoto()" alt="Captured photo" />
          </div>
        </div>

        <div class="signature-section">
          <p>Customer Signature</p>
          <canvas #signaturePad class="signature-canvas"></canvas>
          <div class="signature-actions">
            <button class="action-btn secondary" (click)="clearSignature()">Clear</button>
            <button class="action-btn" (click)="saveSignature()">Save Signature</button>
          </div>
        </div>

        <div class="gps-section">
          <button class="action-btn" (click)="captureGps()" [disabled]="gpsCaptured()">
            {{ gpsCaptured() ? '✓ Location Captured' : '📍 Capture GPS Location' }}
          </button>
          <p class="gps-coords" *ngIf="gpsCoords()">{{ gpsCoords() }}</p>
        </div>

        <div class="status-buttons">
          <button class="status-btn deliver" (click)="updateStatus('DELIVERED')" [disabled]="!canDeliver()">
            Mark Delivered
          </button>
          <button class="status-btn fail" (click)="updateStatus('FAILED')">
            Mark Failed
          </button>
          <button class="status-btn postpone" (click)="updateStatus('POSTPONED')">
            Postpone
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-detail { padding: 0.75rem; padding-bottom: 2rem; }
    .detail-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .back-btn { padding: 0.375rem 0.75rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; cursor: pointer; }
    .tracking-number { font-weight: 700; color: var(--trackora-primary); flex: 1; }
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .PENDING { background: #FEF3C7; color: #92400E; }
    .OUT_FOR_DELIVERY { background: #E0E7FF; color: #3730A3; }
    .DELIVERED { background: #D1FAE5; color: #065F46; }
    .FAILED { background: #FEE2E2; color: #991B1B; }
    .customer-card, .cod-card, .status-update { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
    .customer-card h3, .cod-card h3, .status-update h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .info-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--trackora-border); }
    .info-row:last-child { border-bottom: none; }
    .label { color: var(--trackora-text-secondary); font-size: 0.875rem; }
    .value { font-weight: 600; font-size: 0.875rem; }
    .phone { color: var(--trackora-primary); text-decoration: none; }
    .cod-amount { font-size: 1.5rem; font-weight: 700; color: var(--trackora-success); margin-bottom: 0.75rem; }
    .confirm-cod-btn { width: 100%; padding: 0.75rem; background: var(--trackora-success); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .confirm-cod-btn:disabled { background: #9CA3AF; }
    .otp-section, .photo-section, .signature-section, .gps-section { margin-bottom: 1.5rem; }
    .otp-inputs { display: flex; gap: 0.5rem; margin: 0.75rem 0; }
    .otp-digit { width: 48px; height: 56px; text-align: center; font-size: 1.25rem; border: 2px solid var(--trackora-border); border-radius: 8px; }
    .otp-digit:focus { outline: none; border-color: var(--trackora-primary); }
    .otp-attempts { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .verify-btn { padding: 0.5rem 1rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .action-btn { padding: 0.625rem 1rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; }
    .action-btn.secondary { background: var(--trackora-surface); color: var(--trackora-text); border: 1px solid var(--trackora-border); }
    .photo-preview { margin-top: 0.75rem; }
    .photo-preview img { max-width: 100%; border-radius: 8px; border: 1px solid var(--trackora-border); }
    .signature-canvas { width: 100%; height: 150px; border: 2px solid var(--trackora-border); border-radius: 8px; background: white; margin: 0.5rem 0; }
    .signature-actions { display: flex; gap: 0.5rem; }
    .gps-coords { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.5rem; }
    .status-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
    .status-btn { padding: 0.875rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .status-btn.deliver { background: #D1FAE5; color: #065F46; }
    .status-btn.fail { background: #FEE2E2; color: #991B1B; }
    .status-btn.postpone { background: #FEF3C7; color: #92400E; }
    .status-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class CourierTaskDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly syncService = inject(OfflineSyncService);
  private readonly courierRepo = inject(CourierRepository);

  readonly task = signal<CachedTask | null>(null);
  readonly showOtp = signal(false);
  readonly otpAttempts = signal(0);
  readonly otpValues = signal<string[]>([]);
  readonly codConfirmed = signal(false);
  readonly capturedPhoto = signal<string | null>(null);
  readonly savedSignature = signal<string | null>(null);
  readonly gpsCaptured = signal(false);
  readonly gpsCoords = signal<string | null>(null);
  readonly gpsLocation = signal<{ lat: number; lng: number } | null>(null);

  otpDigits = [0, 1, 2, 3];

  @ViewChild('signaturePad', { static: true }) signaturePad!: ElementRef<HTMLCanvasElement>;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private isDrawing = false;

  private mouseDownHandler!: (e: MouseEvent) => void;
  private mouseMoveHandler!: (e: MouseEvent) => void;
  private mouseUpHandler!: () => void;
  private touchStartHandler!: (e: TouchEvent) => void;
  private touchMoveHandler!: (e: TouchEvent) => void;
  private touchEndHandler!: () => void;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTask(id);
  }

  ngOnDestroy(): void {
    const canvas = this.signaturePad?.nativeElement;
    if (!canvas) return;
    canvas.removeEventListener('mousedown', this.mouseDownHandler);
    canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    canvas.removeEventListener('mouseup', this.mouseUpHandler);
    canvas.removeEventListener('touchstart', this.touchStartHandler);
    canvas.removeEventListener('touchmove', this.touchMoveHandler);
    canvas.removeEventListener('touchend', this.touchEndHandler);
  }

  private async loadTask(id: string): Promise<void> {
    const t = await courierDb.cachedTasks.get(id);
    if (t) {
      this.task.set(t);
      this.initSignaturePad();
      return;
    }

    try {
      const apiTask = await firstValueFrom(this.courierRepo.getTaskById(id));
      const cachedTask = this.toCachedTask(apiTask);
      await courierDb.cachedTasks.put(cachedTask);
      this.task.set(cachedTask);
      this.initSignaturePad();
    } catch {
      this.initSignaturePad();
    }
  }

  private toCachedTask(task: CourierTask): CachedTask {
    return {
      id: task.shipmentId ?? task.id ?? task.trackingNumber,
      trackingNumber: task.trackingNumber,
      customerName: task.customerName,
      customerPhone: task.customerPhone ?? task.customerPhoneMasked ?? '',
      address: task.addressText ?? task.address ?? '',
      governorate: task.governorate ?? '',
      city: task.city ?? '',
      status: task.status,
      codAmount: task.codAmount,
      deliveryFee: task.deliveryFee ?? 0,
      notes: task.notes,
      lat: task.lat,
      lng: task.lng,
      assignedAt: task.assignedAt ?? new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    }
  }

  private initSignaturePad(): void {
    const canvas = this.signaturePad.nativeElement;
    this.canvasContext = canvas.getContext('2d');
    if (!this.canvasContext) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.canvasContext.strokeStyle = '#000';
    this.canvasContext.lineWidth = 2;

    this.mouseDownHandler = (e) => this.startDrawing(e);
    this.mouseMoveHandler = (e) => this.draw(e);
    this.mouseUpHandler = () => this.stopDrawing();
    this.touchStartHandler = (e) => this.startDrawing(e.touches[0] as any);
    this.touchMoveHandler = (e) => this.draw(e.touches[0] as any);
    this.touchEndHandler = () => this.stopDrawing();

    canvas.addEventListener('mousedown', this.mouseDownHandler);
    canvas.addEventListener('mousemove', this.mouseMoveHandler);
    canvas.addEventListener('mouseup', this.mouseUpHandler);
    canvas.addEventListener('touchstart', this.touchStartHandler);
    canvas.addEventListener('touchmove', this.touchMoveHandler);
    canvas.addEventListener('touchend', this.touchEndHandler);
  }

  private startDrawing(e: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const canvas = this.signaturePad.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = (e as MouseEvent).clientX || (e as any).clientX;
    const clientY = (e as MouseEvent).clientY || (e as any).clientY;
    this.canvasContext?.beginPath();
    this.canvasContext?.moveTo(clientX - rect.left, clientY - rect.top);
  }

  private draw(e: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.signaturePad.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = (e as MouseEvent).clientX || (e as any).clientX;
    const clientY = (e as MouseEvent).clientY || (e as any).clientY;
    this.canvasContext?.lineTo(clientX - rect.left, clientY - rect.top);
    this.canvasContext?.stroke();
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  onOtpInput(event: Event, index: number): void {
    const value = (event.target as HTMLInputElement).value;
    const values = [...this.otpValues()];
    values[index] = value;
    this.otpValues.set(values);

    // Auto-focus next input
    if (value && index < 3) {
      const inputs = (event.target as HTMLElement).parentElement?.querySelectorAll('input');
      inputs?.[index + 1]?.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpValues().filter((v) => v).length === 4;
  }

  verifyOtp(): void {
    this.otpAttempts.update((n) => n + 1);
    this.showOtp.set(false);
  }

  confirmCod(): void {
    this.codConfirmed.set(true);
  }

  onPhotoCapture(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.capturedPhoto.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearSignature(): void {
    const canvas = this.signaturePad.nativeElement;
    this.canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
  }

  saveSignature(): void {
    const canvas = this.signaturePad.nativeElement;
    this.savedSignature.set(canvas.toDataURL('image/png'));
  }

  captureGps(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.gpsCoords.set(`${position.coords.latitude}, ${position.coords.longitude}`);
        this.gpsLocation.set({ lat: position.coords.latitude, lng: position.coords.longitude });
        this.gpsCaptured.set(true);
      },
      () => {
        this.gpsCoords.set('Location unavailable');
      }
    );
  }

  canDeliver(): boolean {
    const t = this.task();
    return this.gpsCaptured() && (!t?.codAmount || this.codConfirmed());
  }

  async updateStatus(status: string): Promise<void> {
    const t = this.task();
    if (!t) return;
    if (status === 'DELIVERED' && t.codAmount && !this.isOtpComplete()) {
      this.showOtp.set(true);
      return;
    }

    await courierDb.cachedTasks.update(t.id, { status });
    this.task.set({ ...t, status });

    const payload: UpdateTaskStatusDto & { timestamp: string } = {
      status,
      otp: this.otpValues().join('') || undefined,
      collectedCash: status === 'DELIVERED' ? t.codAmount : undefined,
      photoUrl: this.capturedPhoto() ?? undefined,
      signatureUrl: this.savedSignature() ?? undefined,
      gpsLocation: this.gpsLocation() ?? undefined,
      notes: t.notes,
      timestamp: new Date().toISOString(),
    };

    await this.syncService.queueUpdate(t.id, 'STATUS_UPDATE', payload);
  }
}
