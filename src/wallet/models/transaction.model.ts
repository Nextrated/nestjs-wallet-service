export interface Transaction {
  id: string;
  walletId: string;
  type: 'FUND' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  createdAt: Date;
  reference?: string;
}
