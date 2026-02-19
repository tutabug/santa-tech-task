import { randomUUID } from 'crypto';

/**
 * PitchStatus - Domain enum (mirrors Prisma enum but owned by domain)
 * Represents the lifecycle state of a pitch.
 */
export enum PitchStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Pitch Entity - Aggregate Root
 *
 * Represents a pitch (song idea pitched to target artists) created by a manager
 * within an organization's song.
 *
 * Pure domain object with no framework dependencies.
 *
 * Fields:
 * - id: unique identifier (generated)
 * - songId: the song being pitched
 * - createdById: user ID of the manager who created the pitch
 * - description: pitch description/notes
 * - status: DRAFT | SUBMITTED | ACCEPTED | REJECTED (defaults to DRAFT)
 * - targetArtists: array of artist names to pitch to (stored as string[])
 * - tags: array of tag labels (stored as string[])
 * - createdAt: timestamp when pitch was created
 * - updatedAt: timestamp when pitch was last modified
 */
export class Pitch {
  private constructor(
    private readonly _id: string,
    private readonly _songId: string,
    private readonly _createdById: string,
    private _description: string,
    private _status: PitchStatus,
    private _targetArtists: string[],
    private _tags: string[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new Pitch entity.
   * Generates a unique ID, sets status to DRAFT, and sets creation timestamp.
   *
   * @param songId - Required song ID being pitched
   * @param createdById - Required user ID of the pitch creator (manager)
   * @param description - Required pitch description
   * @param targetArtists - Target artist names to pitch to
   * @param tags - Tags/labels for the pitch
   */
  static create(
    songId: string,
    createdById: string,
    description: string,
    targetArtists: string[],
    tags: string[],
  ): Pitch {
    const now = new Date();
    return new Pitch(
      randomUUID(),
      songId,
      createdById,
      description,
      PitchStatus.DRAFT,
      targetArtists,
      tags,
      now,
      now,
    );
  }

  /**
   * Factory method to reconstruct a Pitch entity from persistence data.
   * Used by repository layer when loading from database.
   */
  static reconstitute(
    id: string,
    songId: string,
    createdById: string,
    description: string,
    status: PitchStatus,
    targetArtists: string[],
    tags: string[],
    createdAt: Date,
    updatedAt: Date,
  ): Pitch {
    return new Pitch(
      id,
      songId,
      createdById,
      description,
      status,
      targetArtists,
      tags,
      createdAt,
      updatedAt,
    );
  }

  // ─── Getters ───────────────────────────────────────────────────

  get id(): string {
    return this._id;
  }

  get songId(): string {
    return this._songId;
  }

  get createdById(): string {
    return this._createdById;
  }

  get description(): string {
    return this._description;
  }

  get status(): PitchStatus {
    return this._status;
  }

  get targetArtists(): string[] {
    return [...this._targetArtists];
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
