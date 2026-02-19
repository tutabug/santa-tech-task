import { randomUUID } from 'crypto';

/**
 * Song Entity - Aggregate Root
 *
 * Represents a song uploaded by a user to an organization.
 * Pure domain object with no framework dependencies.
 *
 * Fields:
 * - id: unique identifier (generated)
 * - title: required, name of the song
 * - artist: optional, artist/composer name
 * - duration: optional, song duration in seconds
 * - filePath: required, local filesystem path to the uploaded file
 * - mimeType: optional, MIME type of the uploaded file
 * - fileSize: optional, file size in bytes
 * - uploadedById: required, user ID who uploaded the song
 * - organizationId: required, organization the song belongs to
 * - createdAt: timestamp when song was created
 * - updatedAt: timestamp when song was last modified
 */
export class Song {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _artist: string | null,
    private _duration: number | null,
    private _filePath: string,
    private _mimeType: string | null,
    private _fileSize: number | null,
    private _uploadedById: string,
    private _organizationId: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new Song entity.
   * Generates a unique ID and sets creation timestamp.
   *
   * @param title - Required song title
   * @param filePath - Required local filesystem path where file is stored
   * @param uploadedById - Required user ID of uploader
   * @param organizationId - Required organization ID
   * @param artist - Optional artist/composer name
   * @param duration - Optional duration in seconds
   * @param mimeType - Optional MIME type
   * @param fileSize - Optional file size in bytes
   */
  static create(
    title: string,
    filePath: string,
    uploadedById: string,
    organizationId: string,
    artist?: string,
    duration?: number,
    mimeType?: string,
    fileSize?: number,
  ): Song {
    const now = new Date();
    return new Song(
      randomUUID(),
      title,
      artist ?? null,
      duration ?? null,
      filePath,
      mimeType ?? null,
      fileSize ?? null,
      uploadedById,
      organizationId,
      now,
      now,
    );
  }

  /**
   * Factory method to reconstruct a Song entity from persistence data.
   * Used by repository layer when loading from database.
   */
  static reconstitute(
    id: string,
    title: string,
    artist: string | null,
    duration: number | null,
    filePath: string,
    mimeType: string | null,
    fileSize: number | null,
    uploadedById: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Song {
    return new Song(
      id,
      title,
      artist,
      duration,
      filePath,
      mimeType,
      fileSize,
      uploadedById,
      organizationId,
      createdAt,
      updatedAt,
    );
  }

  // ── Domain Methods ───────────────────────────────────────────────────

  /**
   * Checks whether this song belongs to the specified organization.
   * Used for cross-aggregate validation when operating on related entities (e.g. Pitch).
   */
  belongsToOrganization(organizationId: string): boolean {
    return this._organizationId === organizationId;
  }

  // ── Getters ──────────────────────────────────────────────────────────

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get artist(): string | null {
    return this._artist;
  }

  get duration(): number | null {
    return this._duration;
  }

  get filePath(): string {
    return this._filePath;
  }

  get mimeType(): string | null {
    return this._mimeType;
  }

  get fileSize(): number | null {
    return this._fileSize;
  }

  get uploadedById(): string {
    return this._uploadedById;
  }

  get organizationId(): string {
    return this._organizationId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
