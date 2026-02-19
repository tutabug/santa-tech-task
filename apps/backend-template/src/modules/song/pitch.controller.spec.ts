import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { PitchController } from './pitch.controller';
import {
  CreatePitchUseCase,
  ListSongPitchesUseCase,
  ListOrganizationPitchesUseCase,
  PitchListItem,
} from './application';
import { Pitch, PitchStatus } from './domain/pitch.entity';
import { PitchResponseDto } from './dto';
import { SessionGuard } from '../../common/guards/session.guard';
import { SongMembershipGuard, SongRoleGuard } from './guards';
import {
  CursorDecodePipe,
  CursorService,
  PaginatedResult,
  PaginationQuery,
} from '../../common/pagination';

describe('PitchController', () => {
  let controller: PitchController;
  let mockCreatePitchUseCase: jest.Mocked<CreatePitchUseCase>;
  let mockListSongPitchesUseCase: jest.Mocked<ListSongPitchesUseCase>;
  let mockListOrganizationPitchesUseCase: jest.Mocked<ListOrganizationPitchesUseCase>;

  const organizationId = 'org-123';
  const userId = 'user-456';
  const songId = 'song-789';

  const mockGuard = { canActivate: (_context: ExecutionContext) => true };

  beforeEach(async () => {
    mockCreatePitchUseCase = { execute: jest.fn() } as any;
    mockListSongPitchesUseCase = { execute: jest.fn() } as any;
    mockListOrganizationPitchesUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PitchController],
      providers: [
        { provide: CreatePitchUseCase, useValue: mockCreatePitchUseCase },
        { provide: ListSongPitchesUseCase, useValue: mockListSongPitchesUseCase },
        { provide: ListOrganizationPitchesUseCase, useValue: mockListOrganizationPitchesUseCase },
        CursorService,
        CursorDecodePipe,
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue(mockGuard)
      .overrideGuard(SongRoleGuard)
      .useValue(mockGuard)
      .overrideGuard(SongMembershipGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<PitchController>(PitchController);
  });

  describe('createPitch', () => {
    it('should create a pitch and return response DTO', async () => {
      const pitch = Pitch.create(
        songId,
        userId,
        'Great summer track',
        ['Ariana Grande'],
        ['pop', 'summer'],
      );

      mockCreatePitchUseCase.execute.mockResolvedValue(pitch);

      const dto = {
        description: 'Great summer track',
        targetArtists: ['Ariana Grande'],
        tags: ['pop', 'summer'],
      };

      const result = await controller.createPitch(
        organizationId,
        songId,
        dto,
        { id: userId },
      );

      expect(mockCreatePitchUseCase.execute).toHaveBeenCalledWith(
        songId,
        organizationId,
        userId,
        dto.description,
        dto.targetArtists,
        dto.tags,
      );
      expect(result).toBeInstanceOf(PitchResponseDto);
      expect(result.id).toBe(pitch.id);
      expect(result.songId).toBe(songId);
      expect(result.description).toBe('Great summer track');
      expect(result.status).toBe(PitchStatus.DRAFT);
      expect(result.targetArtists).toEqual(['Ariana Grande']);
      expect(result.tags).toEqual(['pop', 'summer']);
    });
  });

  describe('listSongPitches', () => {
    const defaultQuery: PaginationQuery = { limit: 100 };

    it('should return paginated list of pitch response DTOs for a song', async () => {
      const now = new Date();
      const items: PitchListItem[] = [
        {
          id: 'pitch-1',
          songId,
          createdById: userId,
          description: 'Pitch 1',
          status: 'DRAFT',
          targetArtists: ['Artist A'],
          tags: ['pop'],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'pitch-2',
          songId,
          createdById: userId,
          description: 'Pitch 2',
          status: 'SUBMITTED',
          targetArtists: ['Artist B'],
          tags: ['rock'],
          createdAt: now,
          updatedAt: now,
        },
      ];

      const paginatedResult: PaginatedResult<PitchListItem> = {
        items,
        pagination: { limit: 100, hasMore: false, nextCursor: null },
      };

      mockListSongPitchesUseCase.execute.mockResolvedValue(paginatedResult);

      const result = await controller.listSongPitches(songId, defaultQuery);

      expect(mockListSongPitchesUseCase.execute).toHaveBeenCalledWith(
        songId,
        defaultQuery,
      );
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(PitchResponseDto);
      expect(result.items[0].id).toBe('pitch-1');
      expect(result.items[1].id).toBe('pitch-2');
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.nextCursor).toBeNull();
    });

    it('should return empty paginated result when no pitches exist', async () => {
      const paginatedResult: PaginatedResult<PitchListItem> = {
        items: [],
        pagination: { limit: 100, hasMore: false, nextCursor: null },
      };

      mockListSongPitchesUseCase.execute.mockResolvedValue(paginatedResult);

      const result = await controller.listSongPitches(songId, defaultQuery);

      expect(result.items).toEqual([]);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('listOrganizationPitches', () => {
    const defaultQuery: PaginationQuery = { limit: 100 };

    it('should return paginated list of pitch response DTOs for an organization', async () => {
      const now = new Date();
      const items: PitchListItem[] = [
        {
          id: 'pitch-1',
          songId: 'song-a',
          createdById: userId,
          description: 'Org pitch',
          status: 'ACCEPTED',
          targetArtists: ['Artist C'],
          tags: ['jazz'],
          createdAt: now,
          updatedAt: now,
        },
      ];

      const paginatedResult: PaginatedResult<PitchListItem> = {
        items,
        pagination: { limit: 100, hasMore: false, nextCursor: null },
      };

      mockListOrganizationPitchesUseCase.execute.mockResolvedValue(paginatedResult);

      const result = await controller.listOrganizationPitches(
        organizationId,
        defaultQuery,
      );

      expect(mockListOrganizationPitchesUseCase.execute).toHaveBeenCalledWith(
        organizationId,
        defaultQuery,
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(PitchResponseDto);
      expect(result.items[0].status).toBe('ACCEPTED');
      expect(result.pagination.hasMore).toBe(false);
    });
  });
});
