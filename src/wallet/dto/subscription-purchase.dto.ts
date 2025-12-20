import { IsEmail, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class SubscriptionPurchaseDto {
  @IsUUID()
  walletId: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsPositive()
  amount: number; // base monthly amount

  @IsOptional()
  @IsString()
  couponCode?: string;
}
