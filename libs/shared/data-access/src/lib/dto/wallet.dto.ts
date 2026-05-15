import { TransactionType } from '@trackora/shared/domain';

export interface WalletResponseDto {
  id?: string;
  merchantId?: string;
  balance?: number;
  availableBalance?: number;
  pendingBalance: number;
  totalCredited: number;
  totalDebited: number;
  currency: string;
  updatedAt?: string;
}

export interface TransactionResponseDto {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceAfter?: number;
  runningBalance?: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  createdAt: string;
}

export interface PayoutRequestDto {
  amount: number;
  method: string;
}

export interface PayoutResponseDto {
  id: string;
  merchantId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  updatedAt: string;
}
