import { OrganizationMemberRepositoryImpl } from './organization-member.repository';
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
    repository = new OrganizationMemberRepositoryImpl({
      tx: mockPrismaService,
    } as any);
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

  describe('findMembership', () => {
    it('should find membership by organizationId and userId', async () => {
      const orgId = 'org-123';
      const userId = 'user-456';
      const now = new Date();

      const prismaMember = {
        id: 'member-123',
        organizationId: orgId,
        userId,
        role: OrganizationRole.MANAGER,
        joinedAt: now,
      };

      mockPrismaService.organizationMember.findUnique = jest
        .fn()
        .mockResolvedValue(prismaMember);

      const result = await repository.findMembership(orgId, userId);

      expect(mockPrismaService.organizationMember.findUnique).toHaveBeenCalledWith(
        {
          where: {
            organizationId_userId: {
              organizationId: orgId,
              userId,
            },
          },
        },
      );

      expect(result).toBeInstanceOf(OrganizationMember);
      expect(result?.organizationId).toBe(orgId);
      expect(result?.userId).toBe(userId);
      expect(result?.role).toBe(OrganizationRole.MANAGER);
    });

    it('should return null when membership does not exist', async () => {
      mockPrismaService.organizationMember.findUnique = jest
        .fn()
        .mockResolvedValue(null);

      const result = await repository.findMembership('org-999', 'user-999');

      expect(result).toBeNull();
    });
  });
});
