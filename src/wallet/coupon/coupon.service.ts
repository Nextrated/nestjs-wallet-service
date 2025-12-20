import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';


@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async applyCoupon(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid coupon');
    }

    if (coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    if (coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    let discount = 0;

    if (coupon.type === 'PERCENTAGE') {
      discount = (coupon.value / 100) * amount;
    } else {
      discount = coupon.value;
    }

    const finalAmount = Math.max(amount - discount, 0);

    return {
      coupon,
      originalAmount: amount,
      finalAmount,
    };
  }

  async incrementUsage(code: string) {
    await this.prisma.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }
}

