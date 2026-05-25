import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export type PayoutMethod = 'BANK_TRANSFER' | 'INSTAPAY' | 'VODAFONE_CASH' | 'ETISALAT_CASH';

export interface PayoutDestination {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  walletNumber?: string;
  iban?: string;
}

export interface Payout {
  id: string;
  merchantId: string;
  amount: number;
  status: PayoutStatus;
  method: PayoutMethod;
  destination: PayoutDestination;
  referenceNumber?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutDto {
  amount: number;
  method: PayoutMethod;
  destination: PayoutDestination;
}

export interface PayoutQuery {
  merchantId?: string;
  status?: PayoutStatus;
  method?: PayoutMethod;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PayoutListResponse {
  data: Payout[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class PayoutRepository {
  constructor(private readonly api: ApiClient) {}

  findAll(query?: PayoutQuery): Observable<PayoutListResponse> {
    return this.api.get<PayoutListResponse>('/payouts', query);
  }

  create(dto: CreatePayoutDto): Observable<Payout> {
    return this.api.post<Payout>('/payouts', dto);
  }
}
