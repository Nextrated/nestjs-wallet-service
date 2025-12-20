import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaModule } from '../../common/database/prisma.module';
import { PurchaseService } from '../purchase/purchase.service';
import { PaystackService } from '../paystack/paystack.service';
import { CouponService } from '../coupon/coupon.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PurchaseService, PaystackService, CouponService],
  imports: [PrismaModule]
})
export class WalletModule {}
