import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PaystackService } from '../paystack/paystack.service';
import { CouponService } from '../coupon/coupon.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
    private readonly couponService: CouponService,
  ) {}

  async oneTimePurchase(
    walletId: string,
    email: string,
    amount: number,
    couponCode?: string,
  ) {
    // Validate wallet existence
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    let finalAmount = amount;
    let couponCodeUsed: string | undefined;

    if (couponCode) {
      const result = await this.couponService.applyCoupon(couponCode, amount);
      couponCodeUsed = result.coupon.code;
      if (couponCodeUsed === 'FIRSTMONTHFREE') {
        throw new BadRequestException(
          'FIRSTMONTHFREE can only be used for subscriptions',
        );
      }

      finalAmount = result.finalAmount;
    }

    // Initialize Paystack transaction
    const response = await this.paystackService['axiosInstance'].post(
      '/transaction/initialize',
      {
        email,
        amount: Math.round(finalAmount * 100), // kobo
        metadata: {
          walletId,
          originalAmount: amount,
          finalAmount,
          couponCode: couponCodeUsed,
          type: 'ONE_TIME',
        },
      },
    );

    const data = response.data.data;

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
      finalAmount,
    };
  }

  async subscriptionPurchase(
    walletId: string,
    email: string,
    amount: number,
    couponCode?: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    let finalAmount = amount;
    let couponCodeUsed: string | undefined;

    if (couponCode) {
      const result = await this.couponService.applyCoupon(couponCode, amount);
      finalAmount = result.finalAmount;
      couponCodeUsed = result.coupon.code;
    }

    // Enforce FIRSTMONTHFREE once per wallet
    if (couponCodeUsed === 'FIRSTMONTHFREE') {
      const alreadyUsed = await this.prisma.transaction.findFirst({
        where: {
          OR: [{ walletId }, { email }],
          type: TransactionType.SUBSCRIPTION_FIRST_CHARGE,
        },
      });

      if (alreadyUsed) {
        throw new BadRequestException(
          'FIRSTMONTHFREE can only be used once per wallet',
        );
      }
    }

    // Activation fee logic
    const ACTIVATION_FEE = 50;
    if (couponCodeUsed === 'FIRSTMONTHFREE' || finalAmount <= 0) {
      finalAmount = ACTIVATION_FEE;
    }

    // Initialize Paystack
    const response = await this.paystackService['axiosInstance'].post(
      '/transaction/initialize',
      {
        email,
        amount: Math.round(finalAmount * 100),
        metadata: {
          walletId,
          originalAmount: amount,
          finalAmount,
          couponCode: couponCodeUsed,
          type: 'SUBSCRIPTION_FIRST_CHARGE',
        },
      },
    );

    const data = response.data.data;

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
      finalAmount,
    };
  }

  async getCustomer(emailOrCode: string): Promise<string> {
    const response = await this.paystackService['axiosInstance'].get(
      `/customer/${emailOrCode}`,
    );

    const customer = response.data.data;

    if (!customer || !customer.customer_code) {
      throw new NotFoundException(`Customer not found for ${emailOrCode}`);
    }

    return customer.customer_code;
  }

  async ensurePlanExists(): Promise<string> {
    // Check DB first
    let plan = await this.prisma.plan.findFirst({
      where: { name: 'Monthly retainer', interval: 'monthly' },
    });

    if (plan) {
      return plan.planCode; // already stored
    }

    // Create plan in Paystack
    const planData = {
      name: 'Monthly retainer',
      interval: 'monthly',
      amount: 500_00, // in kobo
    };

    const response = await this.paystackService['axiosInstance'].post(
      '/plan',
      planData,
    );
    const planCode = response.data.data.plan_code;

    // Save in DB
    plan = await this.prisma.plan.create({
      data: {
        name: planData.name,
        interval: planData.interval,
        amount: planData.amount,
        planCode,
      },
    });

    return planCode;
  }

  async createSubscription(
    customerCode: string,
    planCode: string,
    startDate?: string,
  ) {
    const data: any = {
      customer: customerCode,
      plan: planCode,
      startDate,
    };

    const response = await this.paystackService['axiosInstance'].post(
      '/subscription',
      data,
    );
    return response.data.data;
  }
}
