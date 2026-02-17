import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../../database/prisma.service';
import { User } from '../domain/user.entity';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const now = new Date();
  const mockUser = User.reconstitute(
    '123',
    'test@example.com',
    'Test User',
    false,
    null,
    now,
    now,
  );

  const mockPrismaUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  };

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new user with generated ID using upsert', async () => {
      const newUser = User.create('new@example.com', 'New User');
      const expectedPrismaUser = {
        ...mockPrismaUser,
        id: newUser.id, // Use the generated ID
        email: 'new@example.com',
        name: 'New User',
      };

      mockPrismaService.user.upsert.mockResolvedValue(expectedPrismaUser);

      const result = await repository.save(newUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: newUser.id },
        }),
      );
      expect(result.id).toBe(newUser.id);
      expect(result.email).toBe('new@example.com');
    });

    it('should update existing user using upsert', async () => {
      mockPrismaService.user.upsert.mockResolvedValue(mockPrismaUser);

      const result = await repository.save(mockUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('saveMany', () => {
    it('should save multiple users in a transaction', async () => {
      const user1 = User.create('user1@example.com', 'User 1');
      const user2 = User.create('user2@example.com', 'User 2');

      const mockTx = {
        user: {
          upsert: jest.fn(),
        },
      };

      mockTx.user.upsert
        .mockResolvedValueOnce({
          ...mockPrismaUser,
          id: user1.id,
          email: 'user1@example.com',
          name: 'User 1',
        })
        .mockResolvedValueOnce({
          ...mockPrismaUser,
          id: user2.id,
          email: 'user2@example.com',
          name: 'User 2',
        });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await repository.saveMany([user1, user2]);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockTx.user.upsert).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('123');

      expect(result).toBeDefined();
      expect(result!.id).toBe('123');
    });

    it('should return null if not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result!.email).toBe('test@example.com');
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockPrismaUser]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123');
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockPrismaUser);

      await repository.delete('123');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '123' } });
    });
  });
});
