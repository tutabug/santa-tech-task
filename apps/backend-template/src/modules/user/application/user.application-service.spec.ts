import {
  IUserRepository,
  USER_REPOSITORY,
} from '../domain/user.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserApplicationService } from './user.application-service';

describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let repository: IUserRepository;

  const mockUser = User.reconstitute(
    '123',
    'test@example.com',
    'Test User',
    false,
    null,
    new Date(),
    new Date(),
  );

  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserApplicationService,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserApplicationService>(UserApplicationService);
    repository = module.get<IUserRepository>(USER_REPOSITORY);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.createUser('new@example.com', 'New User');

      expect(repository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(result.name).toBe('New User');
    });

    it('should throw error if user already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.createUser('test@example.com', 'Test User'),
      ).rejects.toThrow('User with this email already exists');
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById('123');

      expect(result).toBe(mockUser);
      expect(repository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      mockRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockUser);
    });
  });

  describe('verifyUser', () => {
    it('should verify user email and save', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.verifyUser('123');

      expect(result.emailVerified).toBe(true);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to verify not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.verifyUser('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
