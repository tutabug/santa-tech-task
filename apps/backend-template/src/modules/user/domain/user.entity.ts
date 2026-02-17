import { randomUUID } from 'crypto';

export class User {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _name: string | null,
    private _emailVerified: boolean,
    private _image: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Factory method for creating a new user (pre-persistence)
  static create(email: string, name?: string, image?: string): User {
    const now = new Date();
    return new User(
      randomUUID(), // Generate ID at creation time for DDD identity
      email,
      name ?? null,
      false,
      image ?? null,
      now,
      now,
    );
  }

  // Factory method for reconstituting from persistence
  static reconstitute(
    id: string,
    email: string,
    name: string | null,
    emailVerified: boolean,
    image: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      email,
      name,
      emailVerified,
      image,
      createdAt,
      updatedAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string | null {
    return this._name;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get image(): string | null {
    return this._image;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Domain Behaviors
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this._name = newName;
    this._updatedAt = new Date();
  }

  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  updateImage(imageUrl: string): void {
    this._image = imageUrl;
    this._updatedAt = new Date();
  }
}
