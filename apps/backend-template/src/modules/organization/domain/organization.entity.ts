import { randomUUID } from 'crypto';

export class Organization {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(name: string, description?: string): Organization {
    const now = new Date();
    return new Organization(
      randomUUID(),
      name,
      description ?? null,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Organization {
    return new Organization(id, name, description, createdAt, updatedAt);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
