import { OrganizationMemberRepositoryImpl } from './organization-member.repository';
import { OrganizationMemberMapper } from './organization-member.mapper';
import {
  OrganizationMember,
  OrganizationRole,
} from '../domain/organization-member.entity';

describe('OrganizationMemberRepository', () => {
  let repository: OrganizationMemberRepositoryImpl;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      organizationMember: {
        upsert: jest.fn(),
      },
    };
    repository = new OrganizationMemberRepositoryImpl(mockPrismaService);
  });

  describe('save', () => {
    it('should save a new organization member and return domain entity', async () => {
      const member = OrganizationMember.create(
        'org-123',
        'user-456',
        OrganizationRole.MANAGER,
      );

      const prismaSaved = {
        id: member.id,
        organizationId: 'org-123',
        userId: 'user-456',
        role: OrganizationRole.MANAGER,
        joinedAt: member.joinedAt,
      };

      mockPrismaService.organizationMember.upsert.mockResolvedValue(
        prismaSaved,
      );

      const result = await repository.save(member);

      expect(mockPrismaService.organizationMember.upsert).toHaveBeenCalledWith({
        where: { id: member.id },
        update: {
          role: OrganizationRole.MANAGER,
        },
        create: {
          id: member.id,
          organizationId: 'org-123',
          userId: 'user-456',
          role: OrganizationRole.MANAGER,
        },
      });

      expect(result).toBeInstanceOf(OrganizationMember);
      expect(result.id).toBe(member.id);
      expect(result.organizationId).toBe('org-123');
      expect(result.userId).toBe('user-456');
      expect(result.role).toBe(OrganizationRole.MANAGER);
    });

    it('should handle SONGWRITER role', async () => {
      const member = OrganizationMember.create(
        'org-789',
        'user-999',
        OrganizationRole.SONGWRITER,
      );

      const prismaSaved = {
        id: member.id,
        organizationId: 'org-789',
        userId: 'user-999',
        role: OrganizationRole.SONGWRITER,
        joinedAt: member.joinedAt,
      };

      mockPrismaService.organizationMember.upsert.mockResolvedValue(
        prismaSaved,
      );

      const result = await repository.save(member);

      expect(result.role).toBe(OrganizationRole.SONGWRITER);
    });

    it('should use upsert for idempotent save', async () => {
      const member = OrganizationMember.create(
        'org-test',
        'user-test',
        OrganizationRole.MANAGER,
      );

      mockPrismaService.organizationMember.upsert.mockResolvedValue({
        id: member.id,
        organizationId: 'org-test',
        userId: 'user-test',
        role: OrganizationRole.MANAGER,
        joinedAt: member.joinedAt,
      });

      await repository.save(member);

      expect(mockPrismaService.organizationMember.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: member.id },
          create: expect.any(Object),
          update: expect.any(Object),
        }),
      );
    });
  });
});
