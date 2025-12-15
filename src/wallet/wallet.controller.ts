import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import type { Wallet } from './models/wallet.model';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  createWallet(): Wallet {
    return this.walletService.createWallet();
  }

  @Get()
  getAllWallets(): Wallet[] {
    return this.walletService.getAllWallets();
  }

  @Get(':id')
  getWallet(@Param('id') id: string) {
    return this.walletService.getWalletById(id);
  }


  @Post(':id/fund')
  fundWallet(
    @Param('id') id: string,
    @Body() dto: FundWalletDto,
  ): Wallet {
    return this.walletService.fundWallet(id, dto.amount);
  }

  @Post('transfer')
  transfer(@Body() dto: TransferDto) {
    this.walletService.transfer(
      dto.fromWalletId,
      dto.toWalletId,
      dto.amount,
    );

    return { message: 'Transfer successful' };
  }
}
