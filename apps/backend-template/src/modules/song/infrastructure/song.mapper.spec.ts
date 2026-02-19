import { SongMapper } from './song.mapper';
import { Song } from '../domain/song.entity';

describe('SongMapper', () => {
  const now = new Date();
  const songId = 'song-123';
  const title = 'Midnight Dreams';
  const artist = 'John Doe';
  const duration = 240;
  const filePath = '/uploads/songs/midnight-dreams-123.mp3';
  const mimeType = 'audio/mpeg';
  const fileSize = 5242880;
  const uploadedById = 'user-456';
  const organizationId = 'org-789';

  describe('toDomain', () => {
    it('should convert Prisma song to domain entity with all fields', () => {
      const prismaSong = {
        id: songId,
        title,
        artist,
        duration,
        filePath,
        mimeType,
        fileSize,
        uploadedById,
        organizationId,
        createdAt: now,
        updatedAt: now,
      };

      const song = SongMapper.toDomain(prismaSong);

      expect(song).toBeInstanceOf(Song);
      expect(song.id).toBe(songId);
      expect(song.title).toBe(title);
      expect(song.artist).toBe(artist);
      expect(song.duration).toBe(duration);
      expect(song.filePath).toBe(filePath);
      expect(song.mimeType).toBe(mimeType);
      expect(song.fileSize).toBe(fileSize);
      expect(song.uploadedById).toBe(uploadedById);
      expect(song.organizationId).toBe(organizationId);
      expect(song.createdAt).toBe(now);
      expect(song.updatedAt).toBe(now);
    });

    it('should handle null optional fields', () => {
      const prismaSong = {
        id: songId,
        title,
        artist: null,
        duration: null,
        filePath,
        mimeType: null,
        fileSize: null,
        uploadedById,
        organizationId,
        createdAt: now,
        updatedAt: now,
      };

      const song = SongMapper.toDomain(prismaSong);

      expect(song.artist).toBeNull();
      expect(song.duration).toBeNull();
      expect(song.mimeType).toBeNull();
      expect(song.fileSize).toBeNull();
    });

    it('should handle zero duration', () => {
      const prismaSong = {
        id: songId,
        title,
        artist,
        duration: 0,
        filePath,
        mimeType,
        fileSize,
        uploadedById,
        organizationId,
        createdAt: now,
        updatedAt: now,
      };

      const song = SongMapper.toDomain(prismaSong);

      expect(song.duration).toBe(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert domain entity to persistence format with all fields', () => {
      const song = Song.create(
        title,
        filePath,
        uploadedById,
        organizationId,
        artist,
        duration,
        mimeType,
        fileSize,
      );

      const persistenceData = SongMapper.toPersistence(song);

      expect(persistenceData.id).toBe(song.id);
      expect(persistenceData.title).toBe(title);
      expect(persistenceData.artist).toBe(artist);
      expect(persistenceData.duration).toBe(duration);
      expect(persistenceData.filePath).toBe(filePath);
      expect(persistenceData.mimeType).toBe(mimeType);
      expect(persistenceData.fileSize).toBe(fileSize);
      expect(persistenceData.uploadedById).toBe(uploadedById);
      expect(persistenceData.organizationId).toBe(organizationId);
      expect(persistenceData.createdAt).toBeInstanceOf(Date);
      expect(persistenceData.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve null optional fields on roundtrip', () => {
      const song = Song.create(
        title,
        filePath,
        uploadedById,
        organizationId,
      );

      const persistenceData = SongMapper.toPersistence(song);

      expect(persistenceData.artist).toBeNull();
      expect(persistenceData.duration).toBeNull();
      expect(persistenceData.mimeType).toBeNull();
      expect(persistenceData.fileSize).toBeNull();
    });

    it('should exclude relations from persistence output', () => {
      const song = Song.create(
        title,
        filePath,
        uploadedById,
        organizationId,
      );

      const persistenceData = SongMapper.toPersistence(song);

      // Make sure relations are not included
      expect((persistenceData as any).uploadedBy).toBeUndefined();
      expect((persistenceData as any).organization).toBeUndefined();
      expect((persistenceData as any).pitches).toBeUndefined();
    });
  });

  describe('roundtrip conversion', () => {
    it('should convert domain → persistence → domain without data loss', () => {
      const originalSong = Song.create(
        title,
        filePath,
        uploadedById,
        organizationId,
        artist,
        duration,
        mimeType,
        fileSize,
      );

      // Domain → Persistence
      const persistenceData = SongMapper.toPersistence(originalSong);

      // Persistence → Domain
      const reconstructedSong = SongMapper.toDomain(
        persistenceData as any,
      );

      expect(reconstructedSong.id).toBe(originalSong.id);
      expect(reconstructedSong.title).toBe(originalSong.title);
      expect(reconstructedSong.artist).toBe(originalSong.artist);
      expect(reconstructedSong.duration).toBe(originalSong.duration);
      expect(reconstructedSong.filePath).toBe(originalSong.filePath);
      expect(reconstructedSong.mimeType).toBe(originalSong.mimeType);
      expect(reconstructedSong.fileSize).toBe(originalSong.fileSize);
      expect(reconstructedSong.uploadedById).toBe(originalSong.uploadedById);
      expect(reconstructedSong.organizationId).toBe(
        originalSong.organizationId,
      );
    });
  });
});
