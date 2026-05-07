import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

export interface CreateMerchantDto {
  businessName: string;
  businessType?: string;
  websiteUrl?: string;
  commissionRate?: string;
  feePerShipment?: string;
}

export interface UpdateFeesDto {
  commissionRate?: string;
  feePerShipment?: string;
}

@Injectable({ providedIn: 'root' })
export class MerchantRepository {
  constructor(private readonly api: ApiClient) {}

  create(dto: CreateMerchantDto): Observable<any> {
    return this.api.post('/merchants', dto);
  }

  findById(id: string): Observable<any> {
    return this.api.get(`/merchants/${id}`);
  }

  updateKyc(id: string): Observable<any> {
    return this.api.patch(`/merchants/${id}/kyc`, {});
  }

  updateFees(id: string, dto: UpdateFeesDto): Observable<any> {
    return this.api.patch(`/merchants/${id}/fees`, dto);
  }

  getWallet(id: string): Observable<any> {
    return this.api.get(`/merchants/${id}/wallet`);
  }

  getWalletTransactions(id: string, query: { type?: string; from?: string; to?: string; page?: string; limit?: string }): Observable<any> {
    return this.api.get(`/merchants/${id}/wallet/transactions`, query);
  }
}
