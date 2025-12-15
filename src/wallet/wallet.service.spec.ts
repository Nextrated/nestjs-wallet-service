import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Wallet } from './models/wallet.model';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a wallet', () => {
    const wallet: Wallet = service.createWallet();
    expect(wallet).toHaveProperty('id');
    expect(wallet.currency).toBe('USD');
    expect(wallet.balance).toBe(0);
  });

  it('should fund a wallet', () => {
    const wallet = service.createWallet();
    const result = service.fundWallet(wallet.id, 100);
    expect(result.balance).toBe(100);
  });

  it('should transfer funds between wallets', () => {
    const wallet1 = service.createWallet();
    const wallet2 = service.createWallet();

    service.fundWallet(wallet1.id, 200);

    // Transfer 50 from wallet1 to wallet2
    service.transfer(wallet1.id, wallet2.id, 50);

    const sender = service.getWalletById(wallet1.id);
    const receiver = service.getWalletById(wallet2.id);

    expect(sender.balance).toBe(150);
    expect(receiver.balance).toBe(50);
  });
});
