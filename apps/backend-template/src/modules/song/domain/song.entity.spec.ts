import { Song } from './song.entity';

describe('Song Entity', () => {
  const validTitle = 'Midnight Dreams';
  const validFilePath = '/uploads/songs/midnight-dreams-123.mp3';
  const validUploadedById = 'user-456';
  const validOrganizationId = 'org-789';
  const validArtist = 'John Doe';
  const validDuration = 240; // 4 minutes
  const validMimeType = 'audio/mpeg';
  const validFileSize = 5242880; // 5MB

  describe('create', () => {
    it('should create a new song with required fields only', () => {
      const song = Song.create(
        validTitle,
        validFilePath,
        validUploadedById,
        validOrganizationId,
      );

      expect(song).toBeDefined();
      expect(song.id).toBeDefined();
      expect(song.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(song.title).toBe(validTitle);
      expect(song.filePath).toBe(validFilePath);
      expect(song.uploadedById).toBe(validUploadedById);
      expect(song.organizationId).toBe(validOrganizationId);
      expect(song.artist).toBeNull();
      expect(song.duration).toBeNull();
      expect(song.mimeType).toBeNull();
      expect(song.fileSize).toBeNull();
      expect(song.createdAt).toBeInstanceOf(Date);
      expect(song.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a song with all optional fields provided', () => {
      const song = Song.create(
        validTitle,
        validFilePath,
        validUploadedById,
        validOrganizationId,
        validArtist,
        validDuration,
        validMimeType,
        validFileSize,
      );

      expect(song.title).toBe(validTitle);
      expect(song.artist).toBe(validArtist);
      expect(song.duration).toBe(validDuration);
      expect(song.mimeType).toBe(validMimeType);
      expect(song.fileSize).toBe(validFileSize);
    });

    it('should generate unique IDs for each new song', () => {
      const song1 = Song.create(
        'Song 1',
        '/path/song1.mp3',
        validUploadedById,
        validOrganizationId,
      );
      const song2 = Song.create(
        'Song 2',
        '/path/song2.mp3',
        validUploadedById,
        validOrganizationId,
      );

      expect(song1.id).not.toBe(song2.id);
    });

    it('should set timestamps on creation', () => {
      const beforeCreation = new Date();
      const song = Song.create(
        validTitle,
        validFilePath,
        validUploadedById,
        validOrganizationId,
      );
      const afterCreation = new Date();

      expect(song.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(song.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(song.updatedAt).toEqual(song.createdAt);
    });

    it('should handle zero duration', () => {
      const song = Song.create(
        validTitle,
        validFilePath,
        validUploadedById,
        validOrganizationId,
        undefined,
        0,
      );

      expect(song.duration).toBe(0);
    });

    it('should handle empty string artist as null', () => {
      const song = Song.create(
        validTitle,
        validFilePath,
        validUploadedById,
        validOrganizationId,
        undefined,
      );

      expect(song.artist).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a song from persistence data with all fields', () => {
      const now = new Date();
      const song = Song.reconstitute(
        'song-123',
        validTitle,
        validArtist,
        validDuration,
        validFilePath,
        validMimeType,
        validFileSize,
        validUploadedById,
        validOrganizationId,
        now,
        now,
      );

      expect(song.id).toBe('song-123');
      expect(song.title).toBe(validTitle);
      expect(song.artist).toBe(validArtist);
      expect(song.duration).toBe(validDuration);
      expect(song.filePath).toBe(validFilePath);
      expect(song.mimeType).toBe(validMimeType);
      expect(song.fileSize).toBe(validFileSize);
      expect(song.uploadedById).toBe(validUploadedById);
      expect(song.organizationId).toBe(validOrganizationId);
      expect(song.createdAt).toBe(now);
      expect(song.updatedAt).toBe(now);
    });

    it('should reconstitute a song with null optional fields', () => {
      const now = new Date();
      const song = Song.reconstitute(
        'song-456',
        validTitle,
        null,
        null,
        validFilePath,
        null,
        null,
        validUploadedById,
        validOrganizationId,
        now,
        now,
      );

      expect(song.artist).toBeNull();
      expect(song.duration).toBeNull();
      expect(song.mimeType).toBeNull();
      expect(song.fileSize).toBeNull();
    });
  });

});

