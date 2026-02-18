import { OrganizationMemberMapper } from './organization-member.mapper';
import {
  OrganizationMember,
  OrganizationRole,
} from '../domain/organization-member.entity';

describe('OrganizationMemberMapper', () => {
  const now = new Date();

  describe('toDomain', () => {
    it('should convert Prisma member to domain entity', () => {
      const prismaMember = {
        id: 'member-123',
        organizationId: 'org-456',
        userId: 'user-789',
        role: OrganizationRole.MANAGER,
        joinedAt: now,
      };

      const member = OrganizationMemberMapper.toDomain(prismaMember);

      expect(member).toBeInstanceOf(OrganizationMember);
      expect(member.id).toBe('member-123');
      expect(member.organizationId).toBe('org-456');
      expect(member.userId).toBe('user-789');
      expect(member.role).toBe(OrganizationRole.MANAGER);
      expect(member.joinedAt).toBe(now);
    });

    it('should convert SONGWRITER role', () => {
      const prismaMember = {
        id: 'member-456',
        organizationId: 'org-789',
        userId: 'user-123',
        role: OrganizationRole.SONGWRITER,
        joinedAt: now,
      };

      const member = OrganizationMemberMapper.toDomain(prismaMember);

      expect(member.role).toBe(OrganizationRole.SONGWRITER);
    });
  });

  describe('toPersistence', () => {
    it('should convert domain entity to persistence format', () => {
      const member = OrganizationMember.create(
        'org-123',
        'user-456',
        OrganizationRole.MANAGER,
      );

      const persistenceData = OrganizationMemberMapper.toPersistence(member);

      expect(persistenceData.id).toBe(member.id);
      expect(persistenceData.organizationId).toBe('org-123');
      expect(persistenceData.userId).toBe('user-456');
      expect(persistenceData.role).toBe(OrganizationRole.MANAGER);
      expect(persistenceData.joinedAt).toBe(member.joinedAt);
    });

    it('should handle SONGWRITER role on roundtrip', () => {
      const member = OrganizationMember.create(
        'org-999',
        'user-888',
        OrganizationRole.SONGWRITER,
      );

      const persistenceData = OrganizationMemberMapper.toPersistence(member);

      expect(persistenceData.role).toBe(OrganizationRole.SONGWRITER);
    });
  });
});
