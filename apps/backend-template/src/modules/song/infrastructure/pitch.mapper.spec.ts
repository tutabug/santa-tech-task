import { PitchMapper } from './pitch.mapper';
import { Pitch, PitchStatus } from '../domain/pitch.entity';

describe('PitchMapper', () => {
  const now = new Date();
  const pitchId = 'pitch-123';
  const songId = 'song-456';
  const createdById = 'user-789';
  const description = 'Upbeat pop track for summer';
  const targetArtistNames = ['Ariana Grande', 'Dua Lipa'];
  const tagNames = ['pop', 'summer'];

  describe('toDomain', () => {
    it('should convert Prisma pitch with relations to domain entity', () => {
      const prismaPitch = {
        id: pitchId,
        songId,
        createdById,
        description,
        status: 'DRAFT' as const,
        createdAt: now,
        updatedAt: now,
        targetArtists: [
          { id: 'ta-1', pitchId, name: 'Ariana Grande' },
          { id: 'ta-2', pitchId, name: 'Dua Lipa' },
        ],
        tags: [
          { id: 'tag-1', name: 'pop' },
          { id: 'tag-2', name: 'summer' },
        ],
      };

      const pitch = PitchMapper.toDomain(prismaPitch);

      expect(pitch).toBeInstanceOf(Pitch);
      expect(pitch.id).toBe(pitchId);
      expect(pitch.songId).toBe(songId);
      expect(pitch.createdById).toBe(createdById);
      expect(pitch.description).toBe(description);
      expect(pitch.status).toBe(PitchStatus.DRAFT);
      expect(pitch.targetArtists).toEqual(targetArtistNames);
      expect(pitch.tags).toEqual(tagNames);
      expect(pitch.createdAt).toBe(now);
      expect(pitch.updatedAt).toBe(now);
    });

    it('should handle empty relations', () => {
      const prismaPitch = {
        id: pitchId,
        songId,
        createdById,
        description,
        status: 'SUBMITTED' as const,
        createdAt: now,
        updatedAt: now,
        targetArtists: [],
        tags: [],
      };

      const pitch = PitchMapper.toDomain(prismaPitch);

      expect(pitch.targetArtists).toEqual([]);
      expect(pitch.tags).toEqual([]);
      expect(pitch.status).toBe(PitchStatus.SUBMITTED);
    });
  });

  describe('toPersistence', () => {
    it('should convert domain entity to persistence format', () => {
      const pitch = Pitch.create(
        songId,
        createdById,
        description,
        targetArtistNames,
        tagNames,
      );

      const persisted = PitchMapper.toPersistence(pitch);

      expect(persisted.id).toBe(pitch.id);
      expect(persisted.songId).toBe(songId);
      expect(persisted.createdById).toBe(createdById);
      expect(persisted.description).toBe(description);
      expect(persisted.status).toBe('DRAFT');
      expect(persisted.createdAt).toBeInstanceOf(Date);
      expect(persisted.updatedAt).toBeInstanceOf(Date);
      // Relations should NOT be in persistence output
      expect(persisted).not.toHaveProperty('targetArtists');
      expect(persisted).not.toHaveProperty('tags');
    });

    it('should roundtrip through toPersistence and toDomain', () => {
      const original = Pitch.create(
        songId,
        createdById,
        description,
        targetArtistNames,
        tagNames,
      );

      const persisted = PitchMapper.toPersistence(original);

      // Simulate what the DB would return (with relations included)
      const dbRecord = {
        ...persisted,
        targetArtists: targetArtistNames.map((name, i) => ({
          id: `ta-${i}`,
          pitchId: original.id,
          name,
        })),
        tags: tagNames.map((name, i) => ({
          id: `tag-${i}`,
          name,
        })),
      };

      const restored = PitchMapper.toDomain(dbRecord);

      expect(restored.id).toBe(original.id);
      expect(restored.songId).toBe(original.songId);
      expect(restored.createdById).toBe(original.createdById);
      expect(restored.description).toBe(original.description);
      expect(restored.status).toBe(original.status);
      expect(restored.targetArtists).toEqual(original.targetArtists);
      expect(restored.tags).toEqual(original.tags);
    });
  });
});
