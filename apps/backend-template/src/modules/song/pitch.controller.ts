import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import {
  ApiPaginatedResponse,
  CursorDecodePipe,
  PaginatedResult,
  PaginationQuery,
} from '../../common/pagination';
import {
  CreatePitchUseCase,
  ListSongPitchesUseCase,
  ListOrganizationPitchesUseCase,
} from './application';
import {
  SongMembershipGuard,
  SongRoleGuard,
  RequireSongRole,
} from './guards';
import {
  CreatePitchDto,
  PitchResponseDto,
} from './dto';

@ApiTags('pitches')
@Controller()
export class PitchController {
  constructor(
    private readonly createPitchUseCase: CreatePitchUseCase,
    private readonly listSongPitchesUseCase: ListSongPitchesUseCase,
    private readonly listOrganizationPitchesUseCase: ListOrganizationPitchesUseCase,
  ) {}

  /**
   * POST /organizations/:id/songs/:songId/pitches
   * Create a new pitch for a song (manager only)
   */
  @Post('organizations/:id/songs/:songId/pitches')
  @UseGuards(SessionGuard, SongRoleGuard)
  @RequireSongRole('MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', description: 'Organization ID', type: String })
  @ApiParam({ name: 'songId', description: 'Song ID', type: String })
  @ApiOperation({
    summary: 'Create a pitch for a song',
    description:
      'Creates a new pitch for a song in the organization. Only managers can create pitches.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pitch successfully created',
    type: PitchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or song does not belong to organization' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a manager in this organization' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async createPitch(
    @Param('id') organizationId: string,
    @Param('songId') songId: string,
    @Body() dto: CreatePitchDto,
    @CurrentUser() user: { id: string },
  ): Promise<PitchResponseDto> {
    const pitch = await this.createPitchUseCase.execute(
      songId,
      organizationId,
      user.id,
      dto.description,
      dto.targetArtists,
      dto.tags,
    );

    return PitchResponseDto.fromAggregate(pitch);
  }

  /**
   * GET /organizations/:id/songs/:songId/pitches
   * List all pitches for a song (any member)
   */
  @Get('organizations/:id/songs/:songId/pitches')
  @UseGuards(SessionGuard, SongMembershipGuard)
  @ApiParam({ name: 'id', description: 'Organization ID', type: String })
  @ApiParam({ name: 'songId', description: 'Song ID', type: String })
  @ApiOperation({
    summary: 'List pitches for a song',
    description:
      'Returns pitches created for a specific song with cursor-based pagination. Accessible to all organization members.',
  })
  @ApiPaginatedResponse(PitchResponseDto)
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a member of this organization' })
  async listSongPitches(
    @Param('songId') songId: string,
    @Query(CursorDecodePipe) query: PaginationQuery,
  ): Promise<PaginatedResult<PitchResponseDto>> {
    const result = await this.listSongPitchesUseCase.execute(songId, query);

    return {
      items: result.items.map(PitchResponseDto.fromReadModel),
      pagination: result.pagination,
    };
  }

  /**
   * GET /organizations/:id/pitches
   * List all pitches in the organization (any member)
   */
  @Get('organizations/:id/pitches')
  @UseGuards(SessionGuard, SongMembershipGuard)
  @ApiParam({ name: 'id', description: 'Organization ID', type: String })
  @ApiOperation({
    summary: 'List all pitches in organization',
    description:
      'Returns all pitches across all songs in the organization with cursor-based pagination. Accessible to all organization members.',
  })
  @ApiPaginatedResponse(PitchResponseDto)
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a member of this organization' })
  async listOrganizationPitches(
    @Param('id') organizationId: string,
    @Query(CursorDecodePipe) query: PaginationQuery,
  ): Promise<PaginatedResult<PitchResponseDto>> {
    const result = await this.listOrganizationPitchesUseCase.execute(
      organizationId,
      query,
    );

    return {
      items: result.items.map(PitchResponseDto.fromReadModel),
      pagination: result.pagination,
    };
  }
}
