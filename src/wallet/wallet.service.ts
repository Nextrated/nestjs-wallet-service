import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Wallet } from './models/wallet.model';
import { Transaction } from './models/transaction.model';

@Injectable()
export class WalletService {
  private wallets: Wallet[] = [];
  private transactions: Transaction[] = [];

  createWallet(): Wallet {
    const wallet: Wallet = {
      id: randomUUID(),
      currency: 'USD',
      balance: 0,
    };

    this.wallets.push(wallet);
    return wallet;
  }

  fundWallet(walletId: string, amount: number): Wallet {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance += amount;

    this.transactions.push({
      id: randomUUID(),
      walletId: wallet.id,
      type: 'FUND',
      amount,
      createdAt: new Date(),
    });

    return wallet;
  }

  transfer(fromWalletId: string, toWalletId: string, amount: number): void {
  if (fromWalletId === toWalletId) {
    throw new BadRequestException('Cannot transfer to the same wallet');
  }

  const sender = this.wallets.find(w => w.id === fromWalletId);
  const receiver = this.wallets.find(w => w.id === toWalletId);

  if (!sender || !receiver) {
    throw new NotFoundException('Sender or receiver wallet not found');
  }

  if (sender.balance < amount) {
    throw new BadRequestException('Insufficient balance');
  }

  // Apply transfer
  sender.balance -= amount;
  receiver.balance += amount;

  // Record transactions
  const now = new Date();

  this.transactions.push(
    {
      id: randomUUID(),
      walletId: sender.id,
      type: 'TRANSFER_OUT',
      amount,
      createdAt: now,
    },
    {
      id: randomUUID(),
      walletId: receiver.id,
      type: 'TRANSFER_IN',
      amount,
      createdAt: now,
    },
  );
}

getAllWallets(): Wallet[] {
  return this.wallets;
}

getWalletById(id: string) {
  const wallet = this.wallets.find(w => w.id === id);
  if (!wallet) {
    throw new NotFoundException('Wallet not found');
  }

  // Get transactions for this wallet
  const walletTransactions = this.transactions.filter(
    (tx) => tx.walletId === id,
  );

  return { ...wallet, transactions: walletTransactions };
}
}


