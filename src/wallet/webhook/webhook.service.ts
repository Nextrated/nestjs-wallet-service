import { Injectable } from '@nestjs/common';
import { CouponService } from '../coupon/coupon.service';
import { PurchaseService } from '../purchase/purchase.service';
import { PrismaService } from '../../common/database/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class WebhookService {
  constructor(
    private readonly couponService: CouponService,
    private readonly purchaseService: PurchaseService,
    private readonly prisma: PrismaService,
  ) {}

  async handleChargeSuccess(eventData: any) {
  const metadata = eventData.metadata;
  if (!metadata) return;

  const reference = eventData.reference;
  const email = eventData.customer.email;
  const paidAt = new Date(eventData.paid_at || eventData.data?.paidAt);
  const amount = eventData.amount / 100; // kobo → naira

  // 1️⃣ Idempotency check
  const existing = await this.prisma.transaction.findUnique({
    where: { reference },
  });

  if (existing) {
    console.log(`Transaction ${reference} already handled`);
    return;
  }

  switch (metadata.type) {
    /* ===================== FUND ===================== */
    case 'FUND': {
      await this.prisma.$transaction(async (tx) => {
        // Credit wallet
        await tx.wallet.update({
          where: { id: metadata.walletId },
          data: { balance: { increment: amount } },
        });

        // Save transaction
        await tx.transaction.create({
          data: {
            walletId: metadata.walletId,
            type: TransactionType.FUND,
            amount,
            reference,
            email,
            createdAt: paidAt,
          },
        });
      });

      break;
    }

    /* ===================== ONE TIME ===================== */
    case 'ONE_TIME': {
      await this.prisma.transaction.create({
        data: {
          walletId: metadata.walletId,
          type: TransactionType.ONE_TIME,
          amount,
          reference,
          email,
          createdAt: paidAt,
        },
      });

      if (metadata.couponCode) {
        await this.couponService.incrementUsage(metadata.couponCode);
      }

      break;
    }

    /* ========== SUBSCRIPTION FIRST CHARGE ========== */
    case 'SUBSCRIPTION_FIRST_CHARGE': {
      await this.prisma.transaction.create({
        data: {
          walletId: metadata.walletId,
          type: TransactionType.SUBSCRIPTION_FIRST_CHARGE,
          amount,
          reference,
          email,
          createdAt: paidAt,
        },
      });

      if (metadata.couponCode) {
        await this.couponService.incrementUsage(metadata.couponCode);
      }

      if (metadata.couponCode === 'FIRSTMONTHFREE') {
        const customerCode = await this.purchaseService.getCustomer(email);
        const planCode = await this.purchaseService.ensurePlanExists();

        const startDate = new Date(paidAt);
        startDate.setMonth(startDate.getMonth() + 1);

        await this.purchaseService.createSubscription(
          customerCode,
          planCode,
          startDate.toISOString(),
        );
      }

      break;
    }

    default:
      console.warn(`Unhandled transaction type: ${metadata.type}`);
  }
}
}