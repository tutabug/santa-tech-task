import { User as PrismaUser } from '@prisma/client';
import { User } from '../domain/user.entity';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  const now = new Date();

  const domainUser = User.reconstitute(
    '123',
    'test@example.com',
    'Test User',
    true,
    'image-url',
    now,
    now,
  );

  const prismaUser: PrismaUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    image: 'image-url',
    createdAt: now,
    updatedAt: now,
  };

  describe('toDomain', () => {
    it('should map prisma user to domain entity', () => {
      const result = UserMapper.toDomain(prismaUser);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
      expect(result.name).toBe(prismaUser.name);
      expect(result.emailVerified).toBe(prismaUser.emailVerified);
      expect(result.image).toBe(prismaUser.image);
      expect(result.createdAt).toEqual(prismaUser.createdAt);
      expect(result.updatedAt).toEqual(prismaUser.updatedAt);
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to persistence object', () => {
      const result = UserMapper.toPersistence(domainUser);

      expect(result.id).toBe(domainUser.id);
      expect(result.email).toBe(domainUser.email);
      expect(result.name).toBe(domainUser.name);
      expect(result.emailVerified).toBe(domainUser.emailVerified);
      expect(result.image).toBe(domainUser.image);
      expect(result.createdAt).toEqual(domainUser.createdAt);
      expect(result.updatedAt).toEqual(domainUser.updatedAt);
    });
  });
});
