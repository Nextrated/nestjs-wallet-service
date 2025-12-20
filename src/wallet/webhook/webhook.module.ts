import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PaystackService } from '../paystack/paystack.service';
import { CouponService } from '../coupon/coupon.service';
import { PurchaseService } from '../purchase/purchase.service';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [WebhookController],
  providers: [
    WebhookService,
    PaystackService,
    CouponService,
    PurchaseService,
    PrismaService,
  ],
})
export class WebhookModule {}
