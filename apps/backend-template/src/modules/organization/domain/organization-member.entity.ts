import { randomUUID } from 'crypto';

export enum OrganizationRole {
  MANAGER = 'MANAGER',
  SONGWRITER = 'SONGWRITER',
}

export class OrganizationMember {
  private constructor(
    private readonly _id: string,
    private readonly _organizationId: string,
    private readonly _userId: string,
    private _role: OrganizationRole,
    private readonly _joinedAt: Date,
  ) {}

  static create(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ): OrganizationMember {
    return new OrganizationMember(
      randomUUID(),
      organizationId,
      userId,
      role,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    organizationId: string,
    userId: string,
    role: OrganizationRole,
    joinedAt: Date,
  ): OrganizationMember {
    return new OrganizationMember(id, organizationId, userId, role, joinedAt);
  }

  get id(): string {
    return this._id;
  }

  get organizationId(): string {
    return this._organizationId;
  }

  get userId(): string {
    return this._userId;
  }

  get role(): OrganizationRole {
    return this._role;
  }

  get joinedAt(): Date {
    return this._joinedAt;
  }
}
