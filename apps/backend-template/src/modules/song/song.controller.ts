import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, parse } from 'path';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import {
  ApiPaginatedResponse,
  CursorDecodePipe,
  PaginatedResult,
  PaginationQuery,
} from '../../common/pagination';
import {
  UploadSongUseCase,
  ListOrganizationSongsUseCase,
  GetSongUseCase,
} from './application';
import {
  SongMembershipGuard,
  SongRoleGuard,
  RequireSongRole,
} from './guards';
import {
  UploadSongDto,
  SongResponseDto,
  SongListItemDto,
} from './dto';

/** Max file size: 50 MB */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Allowed audio MIME types (validated via magic numbers by NestJS FileTypeValidator) */
const AUDIO_MIME_REGEX = /^audio\/(mpeg|wav|ogg|flac|aac|mp4|x-m4a)$/;

@ApiTags('songs')
@Controller('organizations/:id/songs')
export class SongController {
  constructor(
    private readonly uploadSongUseCase: UploadSongUseCase,
    private readonly listOrganizationSongsUseCase: ListOrganizationSongsUseCase,
    private readonly getSongUseCase: GetSongUseCase,
  ) {}

  /**
   * POST /organizations/:id/songs
   * Upload a new song file
   */
  @Post()
  @UseGuards(SessionGuard, SongRoleGuard)
  @RequireSongRole('SONGWRITER')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/songs',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          const name = parse(file.originalname).name;
          cb(null, `${name}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Song file upload with metadata',
    schema: {
      type: 'object',
      required: ['title', 'file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (mp3, wav, ogg, flac, aac, m4a). Max 50 MB.',
        },
        title: {
          type: 'string',
          example: 'Midnight Dreams',
          description: 'Title of the song',
        },
        artist: {
          type: 'string',
          example: 'John Doe',
          description: 'Artist name (optional)',
        },
        duration: {
          type: 'integer',
          example: 240,
          description: 'Duration in seconds (optional)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a song',
    description:
      'Uploads a song file to the organization. Only songwriters can upload. ' +
      'File must be audio format (mp3, wav, ogg, flac, aac, m4a). Max size 50 MB.',
  })
  @ApiResponse({
    status: 201,
    description: 'Song successfully uploaded',
    type: SongResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a songwriter in this organization' })
  @ApiResponse({ status: 413, description: 'File too large (max 50 MB)' })
  async uploadSong(
    @Param('id') organizationId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: AUDIO_MIME_REGEX,
          fallbackToMimetype: true,
        })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadSongDto,
    @CurrentUser() user: { id: string },
  ): Promise<SongResponseDto> {
    const song = await this.uploadSongUseCase.execute(
      dto.title,
      file.path,
      user.id,
      organizationId,
      dto.artist,
      dto.duration,
      file.mimetype,
      file.size,
    );

    return SongResponseDto.fromAggregate(song);
  }

  /**
   * GET /organizations/:id/songs
   * List all songs in the organization
   */
  @Get()
  @UseGuards(SessionGuard, SongMembershipGuard)
  @ApiOperation({
    summary: 'List songs in organization',
    description:
      'Returns all songs in the organization with cursor-based pagination. Accessible to all members.',
  })
  @ApiPaginatedResponse(SongListItemDto)
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a member of this organization' })
  async listSongs(
    @Param('id') organizationId: string,
    @Query(CursorDecodePipe) query: PaginationQuery,
  ): Promise<PaginatedResult<SongListItemDto>> {
    const result = await this.listOrganizationSongsUseCase.execute(
      organizationId,
      query,
    );

    return {
      items: result.items as SongListItemDto[],
      pagination: result.pagination,
    };
  }

  /**
   * GET /organizations/:id/songs/:songId
   * Get a single song's details
   */
  @Get(':songId')
  @UseGuards(SessionGuard, SongMembershipGuard)
  @ApiOperation({
    summary: 'Get song details',
    description: 'Returns details of a specific song. Accessible to organization members.',
  })
  @ApiResponse({ status: 200, description: 'Song found', type: SongResponseDto })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'User is not a member of this organization' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async getSong(
    @Param('songId') songId: string,
  ): Promise<SongResponseDto> {
    const song = await this.getSongUseCase.execute(songId);
    return SongResponseDto.fromAggregate(song);
  }
}
