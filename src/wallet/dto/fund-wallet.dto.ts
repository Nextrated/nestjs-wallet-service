import { IsNumber, IsPositive, IsEmail } from 'class-validator';

export class FundWalletDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
