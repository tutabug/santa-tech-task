import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { SongController } from './song.controller';
import {
  UploadSongUseCase,
  ListOrganizationSongsUseCase,
  GetSongUseCase,
} from './application';
import { Song } from './domain/song.entity';
import { SongResponseDto } from './dto';
import { SessionGuard } from '../../common/guards/session.guard';
import { CursorDecodePipe, CursorService } from '../../common/pagination';
import {
  OrganizationMembershipGuard,
  OrganizationRoleGuard,
} from '../organization/guards';

describe('SongController', () => {
  let controller: SongController;
  let mockUploadSongUseCase: jest.Mocked<UploadSongUseCase>;
  let mockListOrganizationSongsUseCase: jest.Mocked<ListOrganizationSongsUseCase>;
  let mockGetSongUseCase: jest.Mocked<GetSongUseCase>;

  const organizationId = 'org-123';
  const userId = 'user-456';
  const songId = 'song-789';

  const mockGuard = { canActivate: (_context: ExecutionContext) => true };

  beforeEach(async () => {
    mockUploadSongUseCase = {
      execute: jest.fn(),
    } as any;

    mockListOrganizationSongsUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetSongUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongController],
      providers: [
        {
          provide: UploadSongUseCase,
          useValue: mockUploadSongUseCase,
        },
        {
          provide: ListOrganizationSongsUseCase,
          useValue: mockListOrganizationSongsUseCase,
        },
        {
          provide: GetSongUseCase,
          useValue: mockGetSongUseCase,
        },
        CursorService,
        CursorDecodePipe,
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue(mockGuard)
      .overrideGuard(OrganizationRoleGuard)
      .useValue(mockGuard)
      .overrideGuard(OrganizationMembershipGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<SongController>(SongController);
  });

  describe('uploadSong', () => {
    it('should upload a song and return response DTO', async () => {
      const song = Song.create(
        'Test Song',
        '/uploads/songs/test.mp3',
        userId,
        organizationId,
        'Test Artist',
        180,
        'audio/mpeg',
        2097152,
      );

      mockUploadSongUseCase.execute.mockResolvedValue(song);

      const file = {
        path: '/uploads/songs/test.mp3',
        mimetype: 'audio/mpeg',
        size: 2097152,
        originalname: 'test.mp3',
      } as any;

      const dto = { title: 'Test Song', artist: 'Test Artist', duration: 180 };

      const result = await controller.uploadSong(
        organizationId,
        file,
        dto,
        { id: userId },
      );

      expect(mockUploadSongUseCase.execute).toHaveBeenCalledWith(
        'Test Song',
        '/uploads/songs/test.mp3',
        userId,
        organizationId,
        'Test Artist',
        180,
        'audio/mpeg',
        2097152,
      );

      expect(result).toBeInstanceOf(SongResponseDto);
      expect(result.title).toBe('Test Song');
      expect(result.artist).toBe('Test Artist');
    });
  });

  describe('listSongs', () => {
    it('should list songs with pagination', async () => {
      const songListItems = [
        {
          id: songId,
          title: 'Song 1',
          artist: 'Artist 1',
          duration: 180,
          mimeType: 'audio/mpeg',
          fileSize: 2097152,
          uploadedById: userId,
          uploaderName: 'John Doe',
          uploaderEmail: 'john@example.com',
          createdAt: new Date(),
        },
      ];

      mockListOrganizationSongsUseCase.execute.mockResolvedValue({
        items: songListItems,
        pagination: {
          limit: 50,
          hasMore: false,
          nextCursor: null,
        },
      });

      const query = { limit: 50 };
      const result = await controller.listSongs(organizationId, query);

      expect(mockListOrganizationSongsUseCase.execute).toHaveBeenCalledWith(
        organizationId,
        query,
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(songId);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('getSong', () => {
    it('should get a song by ID', async () => {
      const song = Song.create(
        'Test Song',
        '/uploads/songs/test.mp3',
        userId,
        organizationId,
      );

      mockGetSongUseCase.execute.mockResolvedValue(song);

      const result = await controller.getSong(songId);

      expect(mockGetSongUseCase.execute).toHaveBeenCalledWith(songId);
      expect(result).toBeInstanceOf(SongResponseDto);
      expect(result.title).toBe('Test Song');
    });

    it('should throw NotFoundException if song does not exist', async () => {
      mockGetSongUseCase.execute.mockRejectedValue(
        new NotFoundException('Song not found'),
      );

      await expect(controller.getSong('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
