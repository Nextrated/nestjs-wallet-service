import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import type { Wallet } from '@prisma/client';
import { Transaction } from '@prisma/client';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { TransferDto } from '../dto/transfer.dto';
import { PurchaseService } from '../purchase/purchase.service';
import { OneTimePurchaseDto } from '../dto/purchase.dto';
import { SubscriptionPurchaseDto } from '../dto/subscription-purchase.dto';

@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly purchaseService: PurchaseService,
  ) {}

  @Post()
  async createWallet(): Promise<Wallet> {
    return this.walletService.createWallet();
  }

  @Post('/purchase')
  async oneTimePurchase(@Body() dto: OneTimePurchaseDto) {
    return this.purchaseService.oneTimePurchase(
      dto.walletId,
      dto.email,
      dto.amount,
      dto.couponCode,
    );
  }

  @Post('/subscription')
  async subscriptionPurchase(@Body() dto: SubscriptionPurchaseDto) {
    return this.purchaseService.subscriptionPurchase(
      dto.walletId,
      dto.email,
      dto.amount,
      dto.couponCode,
    );
  }

  @Get()
  async getAllWallets(): Promise<Wallet[]> {
    return this.walletService.getAllWallets();
  }

  @Get(':id')
  async getWallet(
    @Param('id') id: string,
  ): Promise<Wallet & { transactions: Transaction[] }> {
    return this.walletService.getWalletById(id);
  }

  @Post(':id/fund')
  async fundWallet(
    @Param('id') id: string, 
    @Body() dto: FundWalletDto,
  ) {
    return this.walletService.fundWallet(id, dto.email, dto.amount);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferDto): Promise<{ message: string }> {
    await this.walletService.transfer(
      dto.fromWalletId,
      dto.toWalletId,
      dto.amount,
    );
    return { message: 'Transfer successful' };
  }
}
