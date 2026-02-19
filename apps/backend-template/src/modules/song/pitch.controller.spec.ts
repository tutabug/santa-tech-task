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
    it('should return list of pitch response DTOs for a song', async () => {
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

      mockListSongPitchesUseCase.execute.mockResolvedValue(items);

      const result = await controller.listSongPitches(songId);

      expect(mockListSongPitchesUseCase.execute).toHaveBeenCalledWith(songId);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PitchResponseDto);
      expect(result[0].id).toBe('pitch-1');
      expect(result[1].id).toBe('pitch-2');
    });

    it('should return empty array when no pitches exist', async () => {
      mockListSongPitchesUseCase.execute.mockResolvedValue([]);

      const result = await controller.listSongPitches(songId);

      expect(result).toEqual([]);
    });
  });

  describe('listOrganizationPitches', () => {
    it('should return list of pitch response DTOs for an organization', async () => {
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

      mockListOrganizationPitchesUseCase.execute.mockResolvedValue(items);

      const result = await controller.listOrganizationPitches(organizationId);

      expect(mockListOrganizationPitchesUseCase.execute).toHaveBeenCalledWith(
        organizationId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PitchResponseDto);
      expect(result[0].status).toBe('ACCEPTED');
    });
  });
});
