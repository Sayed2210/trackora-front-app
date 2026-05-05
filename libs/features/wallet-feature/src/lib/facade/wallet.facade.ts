import { Injectable, signal, computed } from '@angular/core';
import { Wallet, Transaction } from '@trackora/shared/domain';
import { WalletRepository } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletFacade {
  private readonly _wallet = signal<Wallet | null>(null);
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly wallet = this._wallet.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly availableBalance = computed(() => this._wallet()?.availableBalance ?? 0);
  readonly pendingBalance = computed(() => this._wallet()?.pendingBalance ?? 0);

  constructor(private readonly repo: WalletRepository) {}

  async loadWallet(): Promise<void> {
    this._loading.set(true);
    try {
      const wallet = await firstValueFrom(this.repo.getWallet());
      this._wallet.set(wallet);
      this._error.set(null);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load wallet');
    } finally {
      this._loading.set(false);
    }
  }

  async loadTransactions(page = 1, limit = 20): Promise<void> {
    this._loading.set(true);
    try {
      const result = await firstValueFrom(this.repo.getTransactions({ page, limit }));
      this._transactions.set(result.data);
      this._error.set(null);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load transactions');
    } finally {
      this._loading.set(false);
    }
  }
}
