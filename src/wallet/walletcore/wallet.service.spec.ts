import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../common/database/prisma.service';
import { Wallet } from '@prisma/client';

describe('WalletService', () => {
  let service: WalletService;

  const prismaMock = {
    wallet: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a wallet', async () => {
    const mockWallet: Wallet = {
      id: 'wallet-1',
      currency: 'USD',
      balance: 0,
      createdAt: new Date(),
    };

    prismaMock.wallet.create.mockResolvedValue(mockWallet);

    const wallet = await service.createWallet();

    expect(wallet).toEqual(mockWallet);
    expect(prismaMock.wallet.create).toHaveBeenCalledWith({
      data: { currency: 'USD', balance: 0 },
    });
  });

  it('should fund a wallet', async () => {
    const wallet: Wallet = {
      id: 'wallet-1',
      currency: 'USD',
      balance: 0,
      createdAt: new Date(),
    };

    prismaMock.wallet.findUnique.mockResolvedValue(wallet);

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback({
        wallet: {
          update: jest.fn().mockResolvedValue({
            ...wallet,
            balance: 100,
          }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({}),
        },
      });
    });

    const result = await service.fundWallet(wallet.id, 100);

    expect(result.balance).toBe(100);
  });

  it('should transfer funds between wallets', async () => {
    const sender = {
      id: 'wallet-1',
      currency: 'USD',
      balance: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const receiver = {
      id: 'wallet-2',
      currency: 'USD',
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        wallet: {
          findUnique: jest
            .fn()
            .mockResolvedValueOnce(sender) // sender
            .mockResolvedValueOnce(receiver), // receiver
          update: jest.fn(),
        },
        transaction: {
          createMany: jest.fn(),
        },
      }),
    );

    await expect(
      service.transfer(sender.id, receiver.id, 50),
    ).resolves.not.toThrow();
  });
});
