import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { Wallet, Transaction, TransactionType } from '@prisma/client';
import { PaystackService } from '../paystack/paystack.service';


@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService,
    private service: PaystackService
  ) {}

  async createWallet(currency = 'USD'): Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        currency,
        balance: 0,
      },
    });
  }

  async fundWallet(
  walletId: string,
  email: string,
  amount: number,
) {
  const wallet = await this.prisma.wallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new NotFoundException('Wallet not found');
  }

  if (amount <= 0) {
    throw new BadRequestException('Amount must be greater than zero');
  }

  // Initialize Paystack transaction
  const response = await this.service['axiosInstance'].post(
    '/transaction/initialize',
    {
      email,
      amount: Math.round(amount * 100), // kobo
      metadata: {
        walletId,
        type: 'FUND',
      },
    },
  );

  const data = response.data.data;

  return {
    authorizationUrl: data.authorization_url,
    reference: data.reference,
    amount,
  };
}


async transfer(fromWalletId: string, toWalletId: string, amount: number): Promise<void> {
  if (fromWalletId === toWalletId) {
    throw new BadRequestException('Cannot transfer to the same wallet');
  }

  await this.prisma.$transaction(async (tx) => {
    const sender = await tx.wallet.findUnique({ where: { id: fromWalletId } });
    const receiver = await tx.wallet.findUnique({ where: { id: toWalletId } });

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver wallet not found');
    }

    if (sender.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const now = new Date();

    await tx.wallet.update({
      where: { id: fromWalletId },
      data: { balance: { decrement: amount } },
    });

    await tx.wallet.update({
      where: { id: toWalletId },
      data: { balance: { increment: amount } },
    });

    await tx.transaction.createMany({
      data: [
        { walletId: fromWalletId, type: TransactionType.TRANSFER_OUT, amount, createdAt: now },
        { walletId: toWalletId, type: TransactionType.TRANSFER_IN, amount, createdAt: now },
      ],
    });
  });
}


  async getAllWallets(): Promise<Wallet[]> {
    return this.prisma.wallet.findMany();
  }

  async getWalletById(walletId: string): Promise<Wallet & { transactions: Transaction[] }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { transactions: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }
}
