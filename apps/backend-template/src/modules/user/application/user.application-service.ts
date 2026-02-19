import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../domain/user.repository.interface';

/**
 * Application Service for User domain.
 *
 * Responsibilities:
 * - Orchestrates use cases (no business logic here)
 * - Coordinates between domain and infrastructure
 * - Transaction boundaries
 *
 * Does NOT:
 * - Contain business rules (those belong in User entity or Domain Services)
 * - Know about DTOs (controller handles mapping)
 */
@Injectable()
export class UserApplicationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(
    email: string,
    name?: string,
    image?: string,
  ): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = User.create(email, name, image);
    return this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.verifyEmail();
    return this.userRepository.save(user);
  }
}
