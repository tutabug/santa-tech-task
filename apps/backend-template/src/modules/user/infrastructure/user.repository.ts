import { IUserRepository } from '../domain/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import { User } from '../domain/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {}

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    // Since User entities always have IDs (generated at creation),
    // we use upsert to handle both create and update scenarios.
    const saved = await this.txHost.tx.user.upsert({
      where: { id: user.id },
      update: {
        email: data.email,
        name: data.name,
        emailVerified: data.emailVerified,
        image: data.image,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        emailVerified: data.emailVerified,
        image: data.image,
      },
    });
    return UserMapper.toDomain(saved);
  }

  async saveMany(users: User[]): Promise<User[]> {
    const results: User[] = [];

    // Use a transaction to ensure atomicity when saving multiple users
    await this.txHost.withTransaction(async () => {
      for (const user of users) {
        const data = UserMapper.toPersistence(user);
        const saved = await this.txHost.tx.user.upsert({
          where: { id: user.id },
          update: {
            email: data.email,
            name: data.name,
            emailVerified: data.emailVerified,
            image: data.image,
            updatedAt: new Date(),
          },
          create: {
            id: data.id,
            email: data.email,
            name: data.name,
            emailVerified: data.emailVerified,
            image: data.image,
          },
        });
        results.push(UserMapper.toDomain(saved));
      }
    });

    return results;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.txHost.tx.user.findMany();
    return users.map(UserMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.txHost.tx.user.delete({
      where: { id },
    });
  }
}
