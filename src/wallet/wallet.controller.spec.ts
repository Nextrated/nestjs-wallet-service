import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import type { Wallet } from './models/wallet.model';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: WalletService;

  const mockWallet: Wallet = {
    id: '123',
    currency: 'USD',
    balance: 0,
  };

  const mockWalletService = {
    createWallet: jest.fn().mockReturnValue(mockWallet),
    getAllWallets: jest.fn().mockReturnValue([mockWallet]),
    getWalletById: jest.fn().mockReturnValue(mockWallet),
    fundWallet: jest.fn().mockReturnValue({ ...mockWallet, balance: 100 }),
    transfer: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService, 
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a wallet', () => {
    const wallet = controller.createWallet();
    expect(wallet).toEqual(mockWallet);
    expect(walletService.createWallet).toHaveBeenCalled();
  });

  it('should get all wallets', () => {
    const wallets = controller.getAllWallets();
    expect(wallets).toEqual([mockWallet]);
    expect(walletService.getAllWallets).toHaveBeenCalled();
  });

  it('should get a wallet by id', () => {
    const wallet = controller.getWallet('123');
    expect(wallet).toEqual(mockWallet);
    expect(walletService.getWalletById).toHaveBeenCalledWith('123');
  });

  it('should fund a wallet', () => {
    const result = controller.fundWallet('123', { amount: 100 });
    expect(result.balance).toBe(100);
    expect(walletService.fundWallet).toHaveBeenCalledWith('123', 100);
  });

  it('should transfer funds', () => {
    const dto = { fromWalletId: '123', toWalletId: '456', amount: 50 };
    const result = controller.transfer(dto);
    expect(result).toEqual({ message: 'Transfer successful' });
    expect(walletService.transfer).toHaveBeenCalledWith(
      dto.fromWalletId,
      dto.toWalletId,
      dto.amount,
    );
  });
});
