import { TransactionType } from '../enums/transaction-type.enum';

export interface Wallet {
  id: string;
  merchantId: string;
  availableBalance: number;
  pendingBalance: number;
  totalCredited: number;
  totalDebited: number;
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
