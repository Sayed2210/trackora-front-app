import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Wallet, Transaction, PaginatedResult, PaginationMeta } from '@trackora/shared/domain';
import { WalletResponseDto, TransactionResponseDto } from '../dto/wallet.dto';
import { WalletMapper } from '../mapper/wallet.mapper';

@Injectable({ providedIn: 'root' })
export class WalletRepository {
  constructor(private readonly api: ApiClient) {}

  getById(id: string): Observable<Wallet> {
    return this.api.get<WalletResponseDto>(`/wallets/${id}`)
      .pipe(map(WalletMapper.toDomain));
  }

  getWallet(): Observable<Wallet> {
    return this.api.get<WalletResponseDto>('/wallet')
      .pipe(map(WalletMapper.toDomain));
  }

  getTransactions(query?: { page?: number; limit?: number }): Observable<PaginatedResult<Transaction>> {
    return this.api.get<{ data: TransactionResponseDto[]; meta: PaginationMeta }>('/wallet/transactions', query)
      .pipe(map((res) => ({
        data: res.data.map(WalletMapper.transactionToDomain),
        meta: res.meta,
      })));
  }

  getMerchantWallet(merchantId: string): Observable<Wallet> {
    return this.api.get<WalletResponseDto>(`/merchants/${merchantId}/wallet`)
      .pipe(map(WalletMapper.toDomain));
  }

  getMerchantTransactions(merchantId: string, query: { type?: string; from?: string; to?: string; page?: string; limit?: string }): Observable<PaginatedResult<Transaction>> {
    return this.api.get<{ data: TransactionResponseDto[]; meta: PaginationMeta }>(`/merchants/${merchantId}/wallet/transactions`, query as any)
      .pipe(map((res) => ({
        data: res.data.map(WalletMapper.transactionToDomain),
        meta: res.meta,
      })));
  }

}
