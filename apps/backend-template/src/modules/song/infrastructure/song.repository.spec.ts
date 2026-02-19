import { SongRepositoryImpl } from './song.repository';
import { Song } from '../domain/song.entity';

describe('SongRepository', () => {
  let repository: SongRepositoryImpl;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      song: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    repository = new SongRepositoryImpl({
      tx: mockPrismaService,
    } as any);
  });

  describe('save', () => {
    it('should save a new song and return domain entity', async () => {
      const song = Song.create(
        'Midnight Dreams',
        '/uploads/songs/midnight-123.mp3',
        'user-456',
        'org-789',
        'John Doe',
        240,
        'audio/mpeg',
        5242880,
      );

      const prismaSaved = {
        id: song.id,
        title: 'Midnight Dreams',
        artist: 'John Doe',
        duration: 240,
        filePath: '/uploads/songs/midnight-123.mp3',
        mimeType: 'audio/mpeg',
        fileSize: 5242880,
        uploadedById: 'user-456',
        organizationId: 'org-789',
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      };

      mockPrismaService.song.upsert.mockResolvedValue(prismaSaved);

      const result = await repository.save(song);

      expect(mockPrismaService.song.upsert).toHaveBeenCalledWith({
        where: { id: song.id },
        update: {
          title: 'Midnight Dreams',
          artist: 'John Doe',
          duration: 240,
          filePath: '/uploads/songs/midnight-123.mp3',
          mimeType: 'audio/mpeg',
          fileSize: 5242880,
          updatedAt: expect.any(Date),
        },
        create: {
          id: song.id,
          title: 'Midnight Dreams',
          artist: 'John Doe',
          duration: 240,
          filePath: '/uploads/songs/midnight-123.mp3',
          mimeType: 'audio/mpeg',
          fileSize: 5242880,
          uploadedById: 'user-456',
          organizationId: 'org-789',
        },
      });

      expect(result).toBeInstanceOf(Song);
      expect(result.id).toBe(song.id);
      expect(result.title).toBe('Midnight Dreams');
      expect(result.artist).toBe('John Doe');
      expect(result.duration).toBe(240);
      expect(result.filePath).toBe('/uploads/songs/midnight-123.mp3');
      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.fileSize).toBe(5242880);
      expect(result.uploadedById).toBe('user-456');
      expect(result.organizationId).toBe('org-789');
    });

    it('should handle null optional fields on save', async () => {
      const song = Song.create(
        'Simple Song',
        '/uploads/songs/simple.mp3',
        'user-789',
        'org-456',
      );

      const prismaSaved = {
        id: song.id,
        title: 'Simple Song',
        artist: null,
        duration: null,
        filePath: '/uploads/songs/simple.mp3',
        mimeType: null,
        fileSize: null,
        uploadedById: 'user-789',
        organizationId: 'org-456',
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      };

      mockPrismaService.song.upsert.mockResolvedValue(prismaSaved);

      const result = await repository.save(song);

      expect(result.artist).toBeNull();
      expect(result.duration).toBeNull();
      expect(result.mimeType).toBeNull();
      expect(result.fileSize).toBeNull();
    });

    it('should use upsert for idempotent save (create or update)', async () => {
      const song = Song.create(
        'Test Song',
        '/uploads/songs/test.mp3',
        'user-123',
        'org-123',
      );

      mockPrismaService.song.upsert.mockResolvedValue({
        id: song.id,
        title: 'Test Song',
        artist: null,
        duration: null,
        filePath: '/uploads/songs/test.mp3',
        mimeType: null,
        fileSize: null,
        uploadedById: 'user-123',
        organizationId: 'org-123',
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      });

      await repository.save(song);

      expect(mockPrismaService.song.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: song.id },
          create: expect.any(Object),
          update: expect.any(Object),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find song by ID and return domain entity', async () => {
      const songId = 'song-123';
      const now = new Date();

      const prismaSong = {
        id: songId,
        title: 'Found Song',
        artist: 'Artist Name',
        duration: 180,
        filePath: '/uploads/songs/found.mp3',
        mimeType: 'audio/mpeg',
        fileSize: 3145728,
        uploadedById: 'user-456',
        organizationId: 'org-789',
        createdAt: now,
        updatedAt: now,
      };

      mockPrismaService.song.findUnique = jest
        .fn()
        .mockResolvedValue(prismaSong);

      const result = await repository.findById(songId);

      expect(mockPrismaService.song.findUnique).toHaveBeenCalledWith({
        where: { id: songId },
      });

      expect(result).toBeInstanceOf(Song);
      expect(result?.id).toBe(songId);
      expect(result?.title).toBe('Found Song');
      expect(result?.artist).toBe('Artist Name');
      expect(result?.duration).toBe(180);
    });

    it('should return null when song does not exist', async () => {
      mockPrismaService.song.findUnique = jest
        .fn()
        .mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle song with null optional fields', async () => {
      const songId = 'song-456';
      const now = new Date();

      const prismaSong = {
        id: songId,
        title: 'Minimal Song',
        artist: null,
        duration: null,
        filePath: '/uploads/songs/minimal.mp3',
        mimeType: null,
        fileSize: null,
        uploadedById: 'user-123',
        organizationId: 'org-456',
        createdAt: now,
        updatedAt: now,
      };

      mockPrismaService.song.findUnique = jest
        .fn()
        .mockResolvedValue(prismaSong);

      const result = await repository.findById(songId);

      expect(result?.artist).toBeNull();
      expect(result?.duration).toBeNull();
      expect(result?.mimeType).toBeNull();
      expect(result?.fileSize).toBeNull();
    });
  });

  describe('findByOrganizationId', () => {
    it('should find all songs for organization and return domain entities', async () => {
      const orgId = 'org-789';
      const now = new Date();

      const prismaSongs = [
        {
          id: 'song-1',
          title: 'Song One',
          artist: 'Artist A',
          duration: 240,
          filePath: '/uploads/songs/song1.mp3',
          mimeType: 'audio/mpeg',
          fileSize: 5242880,
          uploadedById: 'user-456',
          organizationId: orgId,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'song-2',
          title: 'Song Two',
          artist: 'Artist B',
          duration: 200,
          filePath: '/uploads/songs/song2.mp3',
          mimeType: 'audio/mpeg',
          fileSize: 4194304,
          uploadedById: 'user-789',
          organizationId: orgId,
          createdAt: new Date(now.getTime() - 1000),
          updatedAt: new Date(now.getTime() - 1000),
        },
      ];

      mockPrismaService.song.findMany = jest
        .fn()
        .mockResolvedValue(prismaSongs);

      const results = await repository.findByOrganizationId(orgId);

      expect(mockPrismaService.song.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: orgId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(Song);
      expect(results[1]).toBeInstanceOf(Song);
      expect(results[0].id).toBe('song-1');
      expect(results[1].id).toBe('song-2');
      expect(results[0].title).toBe('Song One');
      expect(results[1].title).toBe('Song Two');
    });

    it('should return empty array if organization has no songs', async () => {
      mockPrismaService.song.findMany = jest.fn().mockResolvedValue([]);

      const results = await repository.findByOrganizationId('empty-org-id');

      expect(results).toEqual([]);
    });

    it('should order results by createdAt descending', async () => {
      const orgId = 'org-456';
      const now = new Date();

      const prismaSongs = [
        {
          id: 'song-newest',
          title: 'Recent Song',
          artist: null,
          duration: null,
          filePath: '/uploads/songs/recent.mp3',
          mimeType: null,
          fileSize: null,
          uploadedById: 'user-123',
          organizationId: orgId,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'song-oldest',
          title: 'Old Song',
          artist: null,
          duration: null,
          filePath: '/uploads/songs/old.mp3',
          mimeType: null,
          fileSize: null,
          uploadedById: 'user-123',
          organizationId: orgId,
          createdAt: new Date(now.getTime() - 86400000),
          updatedAt: new Date(now.getTime() - 86400000),
        },
      ];

      mockPrismaService.song.findMany = jest
        .fn()
        .mockResolvedValue(prismaSongs);

      const results = await repository.findByOrganizationId(orgId);

      // Results should be ordered newest first (desc)
      expect(results[0].id).toBe('song-newest');
      expect(results[1].id).toBe('song-oldest');
    });

    it('should handle songs with mixed optional field presence', async () => {
      const orgId = 'org-999';
      const now = new Date();

      const prismaSongs = [
        {
          id: 'song-complete',
          title: 'Complete Song',
          artist: 'Full Artist',
          duration: 300,
          filePath: '/uploads/songs/complete.mp3',
          mimeType: 'audio/mpeg',
          fileSize: 6291456,
          uploadedById: 'user-456',
          organizationId: orgId,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'song-minimal',
          title: 'Minimal Song',
          artist: null,
          duration: null,
          filePath: '/uploads/songs/minimal.mp3',
          mimeType: null,
          fileSize: null,
          uploadedById: 'user-789',
          organizationId: orgId,
          createdAt: new Date(now.getTime() - 1000),
          updatedAt: new Date(now.getTime() - 1000),
        },
      ];

      mockPrismaService.song.findMany = jest
        .fn()
        .mockResolvedValue(prismaSongs);

      const results = await repository.findByOrganizationId(orgId);

      expect(results).toHaveLength(2);
      expect(results[0].artist).toBe('Full Artist');
      expect(results[0].duration).toBe(300);
      expect(results[1].artist).toBeNull();
      expect(results[1].duration).toBeNull();
    });
  });
});
