import { Organization } from './organization.entity';

describe('Organization Entity', () => {
  const validName = 'Songwriters United';
  const validDescription = 'A collective of songwriters.';

  describe('create', () => {
    it('should create a new organization with generated ID', () => {
      const organization = Organization.create(validName, validDescription);

      expect(organization).toBeDefined();
      expect(organization.id).toBeDefined();
      expect(organization.id).not.toBe('');
      expect(organization.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(organization.name).toBe(validName);
      expect(organization.description).toBe(validDescription);
      expect(organization.createdAt).toBeInstanceOf(Date);
      expect(organization.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an organization without optional description', () => {
      const organization = Organization.create(validName);

      expect(organization.description).toBeNull();
    });

    it('should generate unique IDs for each new organization', () => {
      const organization1 = Organization.create('Org 1');
      const organization2 = Organization.create('Org 2');

      expect(organization1.id).not.toBe(organization2.id);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute an organization from persistence data', () => {
      const now = new Date();
      const organization = Organization.reconstitute(
        'org-123',
        validName,
        validDescription,
        now,
        now,
      );

      expect(organization.id).toBe('org-123');
      expect(organization.name).toBe(validName);
      expect(organization.description).toBe(validDescription);
      expect(organization.createdAt).toBe(now);
      expect(organization.updatedAt).toBe(now);
    });
  });
});
