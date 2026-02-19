import { Pitch, PitchStatus } from './pitch.entity';

describe('Pitch Entity', () => {
  const validSongId = 'song-123';
  const validCreatedById = 'user-456';
  const validDescription = 'Upbeat pop track perfect for summer release';
  const validTargetArtists = ['Ariana Grande', 'Dua Lipa'];
  const validTags = ['pop', 'summer', 'upbeat'];

  describe('create', () => {
    it('should create a new pitch with all required fields', () => {
      const pitch = Pitch.create(
        validSongId,
        validCreatedById,
        validDescription,
        validTargetArtists,
        validTags,
      );

      expect(pitch).toBeDefined();
      expect(pitch.id).toBeDefined();
      expect(pitch.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(pitch.songId).toBe(validSongId);
      expect(pitch.createdById).toBe(validCreatedById);
      expect(pitch.description).toBe(validDescription);
      expect(pitch.targetArtists).toEqual(validTargetArtists);
      expect(pitch.tags).toEqual(validTags);
      expect(pitch.createdAt).toBeInstanceOf(Date);
      expect(pitch.updatedAt).toBeInstanceOf(Date);
    });

    it('should default status to DRAFT', () => {
      const pitch = Pitch.create(
        validSongId,
        validCreatedById,
        validDescription,
        validTargetArtists,
        validTags,
      );

      expect(pitch.status).toBe(PitchStatus.DRAFT);
    });

    it('should generate unique IDs for each new pitch', () => {
      const pitch1 = Pitch.create(
        validSongId,
        validCreatedById,
        'Description 1',
        validTargetArtists,
        validTags,
      );
      const pitch2 = Pitch.create(
        validSongId,
        validCreatedById,
        'Description 2',
        validTargetArtists,
        validTags,
      );

      expect(pitch1.id).not.toBe(pitch2.id);
    });

    it('should set timestamps on creation', () => {
      const beforeCreation = new Date();
      const pitch = Pitch.create(
        validSongId,
        validCreatedById,
        validDescription,
        validTargetArtists,
        validTags,
      );
      const afterCreation = new Date();

      expect(pitch.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(pitch.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(pitch.updatedAt).toEqual(pitch.createdAt);
    });

    it('should handle empty tags array', () => {
      const pitch = Pitch.create(
        validSongId,
        validCreatedById,
        validDescription,
        validTargetArtists,
        [],
      );

      expect(pitch.tags).toEqual([]);
    });

    it('should return defensive copies of arrays', () => {
      const pitch = Pitch.create(
        validSongId,
        validCreatedById,
        validDescription,
        validTargetArtists,
        validTags,
      );

      const artists = pitch.targetArtists;
      artists.push('Modified');

      expect(pitch.targetArtists).toEqual(validTargetArtists);
      expect(pitch.targetArtists).not.toContain('Modified');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a pitch from persistence data', () => {
      const now = new Date();
      const pitch = Pitch.reconstitute(
        'pitch-123',
        validSongId,
        validCreatedById,
        validDescription,
        PitchStatus.SUBMITTED,
        validTargetArtists,
        validTags,
        now,
        now,
      );

      expect(pitch.id).toBe('pitch-123');
      expect(pitch.songId).toBe(validSongId);
      expect(pitch.createdById).toBe(validCreatedById);
      expect(pitch.description).toBe(validDescription);
      expect(pitch.status).toBe(PitchStatus.SUBMITTED);
      expect(pitch.targetArtists).toEqual(validTargetArtists);
      expect(pitch.tags).toEqual(validTags);
      expect(pitch.createdAt).toBe(now);
      expect(pitch.updatedAt).toBe(now);
    });

    it('should reconstitute with any valid status', () => {
      const now = new Date();

      for (const status of Object.values(PitchStatus)) {
        const pitch = Pitch.reconstitute(
          'pitch-123',
          validSongId,
          validCreatedById,
          validDescription,
          status,
          validTargetArtists,
          validTags,
          now,
          now,
        );

        expect(pitch.status).toBe(status);
      }
    });
  });
});
