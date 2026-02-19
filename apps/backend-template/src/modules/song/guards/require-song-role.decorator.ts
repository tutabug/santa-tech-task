import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SONG_ROLE_KEY = 'requireSongRole';

/**
 * Decorator to specify the required organization role for a Song endpoint.
 * Used together with SongRoleGuard.
 *
 * @example @RequireSongRole('SONGWRITER')
 */
export const RequireSongRole = (role: string) =>
  SetMetadata(REQUIRE_SONG_ROLE_KEY, role);
