import { User } from './user.entity';

describe('User Entity', () => {
  const validEmail = 'test@example.com';
  const validName = 'Test User';
  const validImage = 'http://example.com/image.png';

  describe('create', () => {
    it('should create a new user with valid properties and generated ID', () => {
      const user = User.create(validEmail, validName, validImage);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.id).not.toBe(''); // ID should be generated (UUID format)
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ); // UUID v4 format
      expect(user.email).toBe(validEmail);
      expect(user.name).toBe(validName);
      expect(user.image).toBe(validImage);
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user without optional fields', () => {
      const user = User.create(validEmail);

      expect(user.name).toBeNull();
      expect(user.image).toBeNull();
    });

    it('should generate unique IDs for each new user', () => {
      const user1 = User.create('user1@example.com');
      const user2 = User.create('user2@example.com');

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user from persistence data', () => {
      const now = new Date();
      const user = User.reconstitute(
        '123',
        validEmail,
        validName,
        true,
        validImage,
        now,
        now,
      );

      expect(user.id).toBe('123');
      expect(user.email).toBe(validEmail);
      expect(user.name).toBe(validName);
      expect(user.emailVerified).toBe(true);
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });
  });

  describe('behaviors', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(validEmail, validName);
    });

    describe('updateName', () => {
      it('should update the name and updatedAt timestamp', () => {
        const oldUpdatedAt = user.updatedAt;
        const newName = 'New Name';

        // Add a small delay to ensure timestamp difference
        jest.useFakeTimers();
        jest.setSystemTime(new Date(oldUpdatedAt.getTime() + 1000));

        user.updateName(newName);

        expect(user.name).toBe(newName);
        expect(user.updatedAt.getTime()).toBeGreaterThan(
          oldUpdatedAt.getTime(),
        );

        jest.useRealTimers();
      });

      it('should throw error for empty name', () => {
        expect(() => user.updateName('')).toThrow('Name cannot be empty');
        expect(() => user.updateName('   ')).toThrow('Name cannot be empty');
      });
    });

    describe('verifyEmail', () => {
      it('should set emailVerified to true and update timestamp', () => {
        const oldUpdatedAt = user.updatedAt;

        jest.useFakeTimers();
        jest.setSystemTime(new Date(oldUpdatedAt.getTime() + 1000));

        user.verifyEmail();

        expect(user.emailVerified).toBe(true);
        expect(user.updatedAt.getTime()).toBeGreaterThan(
          oldUpdatedAt.getTime(),
        );

        jest.useRealTimers();
      });
    });

    describe('updateImage', () => {
      it('should update image and timestamp', () => {
        const oldUpdatedAt = user.updatedAt;
        const newImage = 'http://new-image.com';

        jest.useFakeTimers();
        jest.setSystemTime(new Date(oldUpdatedAt.getTime() + 1000));

        user.updateImage(newImage);

        expect(user.image).toBe(newImage);
        expect(user.updatedAt.getTime()).toBeGreaterThan(
          oldUpdatedAt.getTime(),
        );

        jest.useRealTimers();
      });
    });
  });
});
