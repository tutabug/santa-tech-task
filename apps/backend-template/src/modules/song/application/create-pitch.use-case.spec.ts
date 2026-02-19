import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePitchUseCase } from './create-pitch.use-case';
import { PitchRepository } from '../domain/pitch.repository.interface';
import { SongRepository } from '../domain/song.repository.interface';
import { Pitch } from '../domain/pitch.entity';
import { Song } from '../domain/song.entity';

jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () =>
    (
      _target: unknown,
      _propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => descriptor,
}));

describe('CreatePitchUseCase', () => {
  let useCase: CreatePitchUseCase;
  let mockPitchRepository: jest.Mocked<PitchRepository>;
  let mockSongRepository: jest.Mocked<SongRepository>;

  const songId = 'song-123';
  const organizationId = 'org-456';
  const userId = 'user-789';
  const description = 'Upbeat pop track for summer';
  const targetArtists = ['Ariana Grande', 'Dua Lipa'];
  const tags = ['pop', 'summer'];

  beforeEach(() => {
    mockPitchRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockSongRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByOrganizationId: jest.fn(),
    } as any;

    useCase = new CreatePitchUseCase(mockPitchRepository, mockSongRepository);
  });

  it('should create a pitch and save to repository', async () => {
    const song = Song.create(
      'Test Song',
      '/uploads/songs/test.mp3',
      'uploader-1',
      organizationId,
    );
    // Override song ID for test predictability
    mockSongRepository.findById.mockResolvedValue(song);
    mockPitchRepository.save.mockImplementation(async (pitch) => pitch);

    const result = await useCase.execute(
      songId,
      organizationId,
      userId,
      description,
      targetArtists,
      tags,
    );

    expect(mockSongRepository.findById).toHaveBeenCalledWith(songId);
    expect(mockPitchRepository.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Pitch);
    expect(result.songId).toBe(songId);
    expect(result.createdById).toBe(userId);
    expect(result.description).toBe(description);
    expect(result.targetArtists).toEqual(targetArtists);
    expect(result.tags).toEqual(tags);
  });

  it('should throw NotFoundException if song does not exist', async () => {
    mockSongRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(songId, organizationId, userId, description, targetArtists, tags),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if song does not belong to the organization', async () => {
    const song = Song.create(
      'Test Song',
      '/uploads/songs/test.mp3',
      'uploader-1',
      'different-org-id',
    );
    mockSongRepository.findById.mockResolvedValue(song);

    await expect(
      useCase.execute(songId, organizationId, userId, description, targetArtists, tags),
    ).rejects.toThrow(BadRequestException);
  });
});
