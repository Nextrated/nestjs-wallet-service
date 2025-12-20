import { IsEmail, IsNumber, IsPositive, IsOptional, IsString, IsUUID } from 'class-validator';

export class OneTimePurchaseDto {
  @IsUUID()
  walletId: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @IsString({ message: 'Coupon code must be a string' })
  @IsOptional()
  couponCode?: string;
}


 


