import { User as PrismaUser } from '@prisma/client';
import { User } from '../domain/user.entity';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.reconstitute(
      raw.id,
      raw.email,
      raw.name,
      raw.emailVerified,
      raw.image,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(user: User): PrismaUser {
    // Note: In a real app, you might not want to return a full Prisma object
    // if you are only doing partial updates, but for full saves this works.
    // Also, Prisma types include relational fields which we don't have here.
    // We cast or construct an object compatible with Prisma's input types.

    // We explicitly map fields.
    // Note: we can't easily implement the full PrismaUser interface because of relations,
    // so this method is often used to prepare data for prisma.create/update calls.
    // However, to satisfy a return type of PrismaUser we'd need all fields.
    // Usually 'toPersistence' returns the data needed for the DB operation.

    // Let's stick to returning a plain object that matches the table structure
    // (excluding relations for now, or letting the repo handle the type narrowing).
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as PrismaUser;
  }
}
