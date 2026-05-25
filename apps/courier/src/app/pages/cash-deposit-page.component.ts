import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CourierRepository } from '@trackora/shared/data-access';
import { courierDb, CashLogEntry } from '../services/offline-store.service';
import { OfflineSyncService } from '../services/offline-sync.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cash-deposit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="cash-deposit-page">
      <div class="page-header">
        <h1>Cash Deposit Log</h1>
        <div class="balance-card">
          <span class="balance-label">Cash on Hand</span>
          <span class="balance-value">{{ cashOnHand() | number:'1.2-2' }} EGP</span>
        </div>
      </div>

      <div class="deposit-form">
        <h3>Log New Deposit</h3>
        <div class="form-row">
          <label>Amount (EGP)</label>
          <input
            type="number"
            [value]="depositAmount()"
            (input)="depositAmount.set(+($any($event.target).value))"
            placeholder="Enter amount"
          />
        </div>
        <div class="form-row">
          <label>Deposited To</label>
          <input
            type="text"
            [value]="depositedTo()"
            (input)="depositedTo.set($any($event.target).value)"
            placeholder="Admin/user ID"
          />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea
            [value]="depositNotes()"
            (input)="depositNotes.set(($any($event.target).value))"
            placeholder="Optional notes..."
            rows="2"
          ></textarea>
        </div>
        <button class="submit-btn" (click)="logDeposit()" [disabled]="depositAmount() <= 0 || !depositedTo()">
          Log Deposit
        </button>
      </div>

      <div class="log-list">
        <h3>Deposit History</h3>
        <div class="log-item" *ngFor="let entry of cashLog()">
          <div class="log-main">
            <span class="log-amount" [class.deposited]="entry.type === 'DEPOSITED'" [class.collected]="entry.type === 'COLLECTED'">
              {{ entry.type === 'DEPOSITED' ? '-' : '+' }}{{ entry.amount | number:'1.2-2' }} EGP
            </span>
            <span class="log-type">{{ entry.type }}</span>
          </div>
          <div class="log-meta">
            <span class="log-time">{{ entry.timestamp | date:'short' }}</span>
            <span class="log-sync" [class.synced]="entry.synced" [class.pending]="!entry.synced">
              {{ entry.synced ? 'Synced' : 'Pending' }}
            </span>
          </div>
          <p class="log-notes" *ngIf="entry.taskId">Task: {{ entry.taskId }}</p>
        </div>
        <div class="empty-state" *ngIf="!cashLog().length">
          <p>No cash transactions yet</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cash-deposit-page { padding: 0.75rem; padding-bottom: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .page-header h1 { font-size: 1.25rem; margin: 0; }
    .balance-card { background: var(--trackora-primary); color: white; padding: 0.75rem 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: flex-end; }
    .balance-label { font-size: 0.75rem; opacity: 0.8; }
    .balance-value { font-size: 1.125rem; font-weight: 700; }
    .deposit-form { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
    .deposit-form h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .form-row { margin-bottom: 0.75rem; }
    .form-row label { display: block; font-size: 0.875rem; color: var(--trackora-text-secondary); margin-bottom: 0.25rem; }
    .form-row input, .form-row textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; box-sizing: border-box; }
    .submit-btn { width: 100%; padding: 0.75rem; background: var(--trackora-success); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .submit-btn:disabled { background: #9CA3AF; cursor: not-allowed; }
    .log-list h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .log-item { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem; }
    .log-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .log-amount { font-size: 1.125rem; font-weight: 700; }
    .log-amount.collected { color: #10B981; }
    .log-amount.deposited { color: #EF4444; }
    .log-type { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; background: var(--trackora-surface); font-weight: 600; }
    .log-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .log-sync { padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 600; }
    .log-sync.synced { background: #D1FAE5; color: #065F46; }
    .log-sync.pending { background: #FEF3C7; color: #92400E; }
    .log-notes { font-size: 0.75rem; color: var(--trackora-text-secondary); margin: 0.5rem 0 0; }
    .empty-state { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }
  `],
})
export class CashDepositPageComponent implements OnInit {
  private readonly syncService = inject(OfflineSyncService);
  private readonly courierRepo = inject(CourierRepository);

  readonly cashLog = signal<CashLogEntry[]>([]);
  readonly cashOnHand = signal(0);
  readonly depositAmount = signal(0);
  readonly depositedTo = signal('');
  readonly depositNotes = signal('');

  ngOnInit(): void {
    this.loadCashLog();
  }

  private async loadCashLog(): Promise<void> {
    const entries = await courierDb.cashLog.toArray();
    // Sort by timestamp desc
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.cashLog.set(entries);

    // Calculate cash on hand: collected - deposited
    const collected = entries.filter((e) => e.type === 'COLLECTED').reduce((sum, e) => sum + e.amount, 0);
    const deposited = entries.filter((e) => e.type === 'DEPOSITED').reduce((sum, e) => sum + e.amount, 0);
    this.cashOnHand.set(collected - deposited);
  }

  async logDeposit(): Promise<void> {
    const amount = this.depositAmount();
    if (amount <= 0) return;

    const entry: CashLogEntry = {
      id: crypto.randomUUID(),
      taskId: this.depositedTo(),
      amount,
      type: 'DEPOSITED',
      timestamp: new Date().toISOString(),
      synced: false,
    };

    try {
      await firstValueFrom(this.courierRepo.logDeposit({
        amount,
        depositedTo: this.depositedTo(),
        notes: this.depositNotes(),
      }));
      entry.synced = true;
    } catch {
      await this.syncService.queueUpdate(entry.id, 'CASH_DEPOSIT', {
        amount,
        depositedTo: this.depositedTo(),
        timestamp: entry.timestamp,
        notes: this.depositNotes(),
      });
    }

    await courierDb.cashLog.add(entry);

    this.depositAmount.set(0);
    this.depositedTo.set('');
    this.depositNotes.set('');
    await this.loadCashLog();
  }
}
