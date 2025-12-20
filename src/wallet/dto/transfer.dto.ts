import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class TransferDto {
  @IsString({ message: 'fromWalletId must be a string' })
  @IsNotEmpty({ message: 'fromWalletId cannot be empty' })
  fromWalletId: string;

  @IsString({ message: 'toWalletId must be a string' })
  @IsNotEmpty({ message: 'toWalletId cannot be empty' })
  toWalletId: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;
}
