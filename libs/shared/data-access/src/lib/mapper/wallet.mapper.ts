import { Wallet, Transaction } from '@trackora/shared/domain';
import { WalletResponseDto, TransactionResponseDto } from '../dto/wallet.dto';

export class WalletMapper {
  static toDomain(dto: WalletResponseDto): Wallet {
    return {
      id: dto.id ?? '',
      merchantId: dto.merchantId ?? '',
      availableBalance: dto.availableBalance ?? dto.balance ?? 0,
      pendingBalance: dto.pendingBalance,
      totalCredited: dto.totalCredited,
      totalDebited: dto.totalDebited,
      currency: dto.currency,
      updatedAt: dto.updatedAt ?? new Date().toISOString(),
    };
  }

  static transactionToDomain(dto: TransactionResponseDto): Transaction {
    return {
      id: dto.id,
      walletId: dto.walletId,
      type: dto.type,
      amount: dto.amount,
      balanceAfter: dto.balanceAfter ?? dto.runningBalance ?? 0,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      description: dto.description,
      createdAt: dto.createdAt,
    };
  }
}
