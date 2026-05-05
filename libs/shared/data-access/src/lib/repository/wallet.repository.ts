import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Wallet, Transaction, PaginatedResult, PaginationMeta } from '@trackora/shared/domain';
import { WalletResponseDto, TransactionResponseDto, PayoutRequestDto, PayoutResponseDto } from '../dto/wallet.dto';
import { WalletMapper } from '../mapper/wallet.mapper';

@Injectable({ providedIn: 'root' })
export class WalletRepository {
  constructor(private readonly api: ApiClient) {}

  getWallet(): Observable<Wallet> {
    return this.api.get<WalletResponseDto>('/wallets/me')
      .pipe(map(WalletMapper.toDomain));
  }

  getTransactions(query: { page?: number; limit?: number; type?: string }): Observable<PaginatedResult<Transaction>> {
    return this.api.get<{ data: TransactionResponseDto[]; meta: PaginationMeta }>('/wallets/me/transactions', query)
      .pipe(map((res) => ({
        data: res.data.map(WalletMapper.transactionToDomain),
        meta: res.meta,
      })));
  }

  requestPayout(dto: PayoutRequestDto): Observable<PayoutResponseDto> {
    return this.api.post<PayoutResponseDto>('/payouts', dto);
  }
}
