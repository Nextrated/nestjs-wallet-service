import { IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferDto {
  @IsString()
  fromWalletId: string;

  @IsString()
  toWalletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
