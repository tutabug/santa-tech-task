import { OrganizationMapper } from './organization.mapper';
import { Organization } from '../domain/organization.entity';

describe('OrganizationMapper', () => {
  const now = new Date();

  describe('toDomain', () => {
    it('should convert Prisma organization to domain entity', () => {
      const prismaOrg = {
        id: 'org-123',
        name: 'Songwriters United',
        description: 'A collective',
        createdAt: now,
        updatedAt: now,
      };

      const organization = OrganizationMapper.toDomain(prismaOrg);

      expect(organization).toBeInstanceOf(Organization);
      expect(organization.id).toBe('org-123');
      expect(organization.name).toBe('Songwriters United');
      expect(organization.description).toBe('A collective');
      expect(organization.createdAt).toBe(now);
      expect(organization.updatedAt).toBe(now);
    });

    it('should handle null description', () => {
      const prismaOrg = {
        id: 'org-456',
        name: 'Another Org',
        description: null,
        createdAt: now,
        updatedAt: now,
      };

      const organization = OrganizationMapper.toDomain(prismaOrg);

      expect(organization.description).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should convert domain entity to persistence format', () => {
      const organization = Organization.create('Test Org', 'A test org');

      const persistenceData = OrganizationMapper.toPersistence(organization);

      expect(persistenceData.id).toBe(organization.id);
      expect(persistenceData.name).toBe('Test Org');
      expect(persistenceData.description).toBe('A test org');
      expect(persistenceData.createdAt).toBe(organization.createdAt);
      expect(persistenceData.updatedAt).toBe(organization.updatedAt);
    });

    it('should preserve null description on roundtrip', () => {
      const organization = Organization.create('Org Without Description');
      const persistenceData = OrganizationMapper.toPersistence(organization);

      expect(persistenceData.description).toBeNull();
    });
  });
});
