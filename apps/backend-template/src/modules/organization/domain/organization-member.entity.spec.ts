import {
  OrganizationMember,
  OrganizationRole,
} from './organization-member.entity';

describe('OrganizationMember Entity', () => {
  const organizationId = 'org-123';
  const userId = 'user-456';

  describe('create', () => {
    it('should create a new member with generated ID', () => {
      const member = OrganizationMember.create(
        organizationId,
        userId,
        OrganizationRole.MANAGER,
      );

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.id).not.toBe('');
      expect(member.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(member.organizationId).toBe(organizationId);
      expect(member.userId).toBe(userId);
      expect(member.role).toBe(OrganizationRole.MANAGER);
      expect(member.joinedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for each new member', () => {
      const member1 = OrganizationMember.create(
        organizationId,
        'user-1',
        OrganizationRole.SONGWRITER,
      );
      const member2 = OrganizationMember.create(
        organizationId,
        'user-2',
        OrganizationRole.SONGWRITER,
      );

      expect(member1.id).not.toBe(member2.id);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a member from persistence data', () => {
      const now = new Date();
      const member = OrganizationMember.reconstitute(
        'member-789',
        organizationId,
        userId,
        OrganizationRole.SONGWRITER,
        now,
      );

      expect(member.id).toBe('member-789');
      expect(member.organizationId).toBe(organizationId);
      expect(member.userId).toBe(userId);
      expect(member.role).toBe(OrganizationRole.SONGWRITER);
      expect(member.joinedAt).toBe(now);
    });
  });
});
