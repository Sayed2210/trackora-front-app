import { TransactionType } from '../enums/transaction-type.enum';

export interface Wallet {
  id: string;
  merchantId: string;
  merchantName?: string;
  availableBalance: number;
  pendingBalance: number;
  totalCredited: number;
  totalDebited: number;
  totalEarned?: number;
  lastPayoutDate?: string;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  createdAt: string;
}
