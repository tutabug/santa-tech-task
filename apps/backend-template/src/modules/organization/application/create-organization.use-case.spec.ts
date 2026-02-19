import { CreateOrganizationUseCase } from './create-organization.use-case';
import { Organization, OrganizationMember, OrganizationRole } from '../domain';

jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () =>
    (
      _target: unknown,
      _propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => descriptor,
}));

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;
  let mockOrganizationRepository: {
    save: jest.Mock;
    findByUserId: jest.Mock;
  };
  let mockOrganizationMemberRepository: {
    save: jest.Mock;
    findMembership: jest.Mock;
  };

  beforeEach(() => {
    mockOrganizationRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
    };

    mockOrganizationMemberRepository = {
      save: jest.fn(),
      findMembership: jest.fn(),
    };

    useCase = new CreateOrganizationUseCase(
      mockOrganizationRepository,
      mockOrganizationMemberRepository,
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
