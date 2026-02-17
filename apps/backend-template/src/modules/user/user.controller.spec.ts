import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from './dto/create-user.dto';
import { ExecutionContext } from '@nestjs/common';
import { SessionGuard } from '../../common/guards/session.guard';
import { User } from './domain/user.entity';
import { UserApplicationService } from './application';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: UserApplicationService;

  const mockUser = User.reconstitute(
    '123',
    'test@example.com',
    'Test User',
    false,
    null,
    new Date(),
    new Date(),
  );

  const mockUserApplicationService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockSessionGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserApplicationService,
          useValue: mockUserApplicationService,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue(mockSessionGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserApplicationService>(UserApplicationService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = { email: 'new@example.com', name: 'New User' };
      mockUserApplicationService.createUser.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      // Controller maps DTO to primitives for the application service
      expect(service.createUser).toHaveBeenCalledWith(dto.email, dto.name);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserApplicationService.getAllUsers.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(service.getAllUsers).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserApplicationService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.findOne('123');

      expect(service.getUserById).toHaveBeenCalledWith('123');
      expect(result.id).toBe(mockUser.id);
    });
  });
});
