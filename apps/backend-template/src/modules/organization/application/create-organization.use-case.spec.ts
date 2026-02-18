import { CreateOrganizationUseCase } from './create-organization.use-case';
import { Organization, OrganizationMember, OrganizationRole } from '../domain';

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;
  let mockOrganizationRepository: any;
  let mockOrganizationMemberRepository: any;
  let mockPrismaService: any;

  beforeEach(() => {
    mockOrganizationRepository = {
      save: jest.fn(),
    };

    mockOrganizationMemberRepository = {
      save: jest.fn(),
    };

    mockPrismaService = {
      $transaction: jest.fn().mockImplementation((callback) => {
        // Simulate transaction by calling the callback
        return callback(null);
      }),
    };

    useCase = new CreateOrganizationUseCase(
      mockOrganizationRepository,
      mockOrganizationMemberRepository,
      mockPrismaService,
    );
  });

  describe('execute', () => {
    it('should create organization and add creator as MANAGER member', async () => {
      const name = 'Songwriters United';
      const description = 'A collective of songwriters';
      const creatorId = 'user-123';

      // Mock the repository saves to return the entities
      mockOrganizationRepository.save.mockImplementation((org) =>
        Promise.resolve(org),
      );
      mockOrganizationMemberRepository.save.mockImplementation((member) =>
        Promise.resolve(member),
      );

      const result = await useCase.execute(name, creatorId, description);

      // Verify organization was created correctly
      expect(result).toBeInstanceOf(Organization);
      expect(result.name).toBe(name);
      expect(result.description).toBe(description);
      expect(result.id).toBeDefined();

      // Verify transaction was used
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Verify both repositories were called
      expect(mockOrganizationRepository.save).toHaveBeenCalledWith(
        expect.any(Organization),
      );
      expect(mockOrganizationMemberRepository.save).toHaveBeenCalledWith(
        expect.any(OrganizationMember),
      );

      // Verify member was created with correct properties
      const memberCall = mockOrganizationMemberRepository.save.mock.calls[0][0];
      expect(memberCall.userId).toBe(creatorId);
      expect(memberCall.role).toBe(OrganizationRole.MANAGER);
      expect(memberCall.organizationId).toBe(result.id);
    });

    it('should create organization without description', async () => {
      const name = 'No Description Org';
      const creatorId = 'user-456';

      mockOrganizationRepository.save.mockImplementation((org) =>
        Promise.resolve(org),
      );
      mockOrganizationMemberRepository.save.mockImplementation((member) =>
        Promise.resolve(member),
      );

      const result = await useCase.execute(name, creatorId);

      expect(result.name).toBe(name);
      expect(result.description).toBeNull();
    });

    it('should ensure atomicity with transaction', async () => {
      const name = 'Transactional Org';
      const creatorId = 'user-789';

      let transactionCallback: any;
      mockPrismaService.$transaction.mockImplementation((callback) => {
        transactionCallback = callback;
        return callback(null);
      });

      mockOrganizationRepository.save.mockImplementation((org) =>
        Promise.resolve(org),
      );
      mockOrganizationMemberRepository.save.mockImplementation((member) =>
        Promise.resolve(member),
      );

      await useCase.execute(name, creatorId);

      // Verify transaction was invoked
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(transactionCallback).toBeDefined();
    });

    it('should maintain proper sequence: org created first, then member', async () => {
      const name = 'Test Org';
      const creatorId = 'user-123';

      const callOrder: string[] = [];

      mockOrganizationRepository.save.mockImplementation((org) => {
        callOrder.push('org-saved');
        return Promise.resolve(org);
      });

      mockOrganizationMemberRepository.save.mockImplementation((member) => {
        callOrder.push('member-saved');
        return Promise.resolve(member);
      });

      await useCase.execute(name, creatorId);

      expect(callOrder).toEqual(['org-saved', 'member-saved']);
    });
  });
});
