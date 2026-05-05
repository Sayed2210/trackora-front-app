import { Wallet, Transaction } from '@trackora/shared/domain';
import { WalletResponseDto, TransactionResponseDto } from '../dto/wallet.dto';

export class WalletMapper {
  static toDomain(dto: WalletResponseDto): Wallet {
    return {
      id: dto.id,
      merchantId: dto.merchantId,
      availableBalance: dto.availableBalance,
      pendingBalance: dto.pendingBalance,
      totalCredited: dto.totalCredited,
      totalDebited: dto.totalDebited,
      currency: dto.currency,
      updatedAt: dto.updatedAt,
    };
  }

  static transactionToDomain(dto: TransactionResponseDto): Transaction {
    return {
      id: dto.id,
      walletId: dto.walletId,
      type: dto.type,
      amount: dto.amount,
      balanceAfter: dto.balanceAfter,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      description: dto.description,
      createdAt: dto.createdAt,
    };
  }
}
