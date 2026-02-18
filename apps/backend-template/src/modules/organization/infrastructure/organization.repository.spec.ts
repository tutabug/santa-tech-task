import { OrganizationRepositoryImpl } from './organization.repository';
import { OrganizationMapper } from './organization.mapper';
import { Organization } from '../domain/organization.entity';

describe('OrganizationRepository', () => {
  let repository: OrganizationRepositoryImpl;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      organization: {
        upsert: jest.fn(),
      },
    };
    repository = new OrganizationRepositoryImpl(mockPrismaService);
  });

  describe('save', () => {
    it('should save a new organization and return domain entity', async () => {
      const organization = Organization.create('Test Org', 'A test org');

      const prismaSaved = {
        id: organization.id,
        name: 'Test Org',
        description: 'A test org',
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };

      mockPrismaService.organization.upsert.mockResolvedValue(prismaSaved);

      const result = await repository.save(organization);

      expect(mockPrismaService.organization.upsert).toHaveBeenCalledWith({
        where: { id: organization.id },
        update: {
          name: 'Test Org',
          description: 'A test org',
          updatedAt: expect.any(Date),
        },
        create: {
          id: organization.id,
          name: 'Test Org',
          description: 'A test org',
        },
      });

      expect(result).toBeInstanceOf(Organization);
      expect(result.id).toBe(organization.id);
      expect(result.name).toBe('Test Org');
      expect(result.description).toBe('A test org');
    });

    it('should handle null description on save', async () => {
      const organization = Organization.create('No Description Org');

      const prismaSaved = {
        id: organization.id,
        name: 'No Description Org',
        description: null,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };

      mockPrismaService.organization.upsert.mockResolvedValue(prismaSaved);

      const result = await repository.save(organization);

      expect(result.description).toBeNull();
    });

    it('should use upsert for idempotent save (create or update)', async () => {
      const organization = Organization.create('Upsert Test');

      mockPrismaService.organization.upsert.mockResolvedValue({
        id: organization.id,
        name: 'Upsert Test',
        description: null,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      });

      await repository.save(organization);

      expect(mockPrismaService.organization.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: organization.id },
          create: expect.any(Object),
          update: expect.any(Object),
        }),
      );
    });
  });
});
