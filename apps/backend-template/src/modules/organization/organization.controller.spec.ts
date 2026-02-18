import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { SessionGuard } from '../../common/guards/session.guard';
import { OrganizationController } from './organization.controller';
import {
  CreateOrganizationUseCase,
  ListUserOrganizationsUseCase,
} from './application';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
} from './dto';
import { Organization } from './domain';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let mockCreateOrganizationUseCase: jest.Mocked<CreateOrganizationUseCase>;
  let mockListUserOrganizationsUseCase: jest.Mocked<ListUserOrganizationsUseCase>;

  const mockSessionGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    mockCreateOrganizationUseCase = {
      execute: jest.fn(),
    } as any;
    mockListUserOrganizationsUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: CreateOrganizationUseCase,
          useValue: mockCreateOrganizationUseCase,
        },
        {
          provide: ListUserOrganizationsUseCase,
          useValue: mockListUserOrganizationsUseCase,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue(mockSessionGuard)
      .compile();

    controller = module.get<OrganizationController>(OrganizationController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUser = { id: 'user-123' };
    const dto: CreateOrganizationDto = {
      name: 'Songwriters United',
      description: 'A collective',
    };

    it('should create organization and return response DTO', async () => {
      const organization = Organization.create(
        dto.name,
        dto.description,
      );

      mockCreateOrganizationUseCase.execute.mockResolvedValue(organization);

      const result = await controller.create(dto, mockUser);

      expect(mockCreateOrganizationUseCase.execute).toHaveBeenCalledWith(
        dto.name,
        mockUser.id,
        dto.description,
      );

      expect(result).toBeInstanceOf(OrganizationResponseDto);
      expect(result.name).toBe(dto.name);
      expect(result.description).toBe(dto.description);
      expect(result.id).toBe(organization.id);
    });

    it('should create organization without description', async () => {
      const dtoNoDesc: CreateOrganizationDto = {
        name: 'No Description Org',
      };

      const organization = Organization.create(dtoNoDesc.name);
      mockCreateOrganizationUseCase.execute.mockResolvedValue(organization);

      const result = await controller.create(dtoNoDesc, mockUser);

      expect(mockCreateOrganizationUseCase.execute).toHaveBeenCalledWith(
        dtoNoDesc.name,
        mockUser.id,
        undefined,
      );

      expect(result.description).toBeNull();
    });

    it('should extract primitives from DTO before calling use case', async () => {
      const organization = Organization.create(dto.name, dto.description);
      mockCreateOrganizationUseCase.execute.mockResolvedValue(organization);

      await controller.create(dto, mockUser);

      // Verify primitives are passed, not the DTO object
      const callArgs = mockCreateOrganizationUseCase.execute.mock.calls[0];
      expect(callArgs[0]).toBe(dto.name);
      expect(callArgs[1]).toBe(mockUser.id);
      expect(callArgs[2]).toBe(dto.description);
    });

    it('should map aggregate to response DTO using fromAggregate', async () => {
      const organization = Organization.create(dto.name, dto.description);
      mockCreateOrganizationUseCase.execute.mockResolvedValue(organization);

      const result = await controller.create(dto, mockUser);

      // Verify the result is properly mapped
      expect(result.id).toBe(organization.id);
      expect(result.name).toBe(organization.name);
      expect(result.description).toBe(organization.description);
      expect(result.createdAt).toBe(organization.createdAt);
      expect(result.updatedAt).toBe(organization.updatedAt);
    });
  });
});
