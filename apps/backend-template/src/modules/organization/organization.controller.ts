import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import {
  ApiPaginatedResponse,
  CursorService,
  DEFAULT_PAGE_LIMIT,
  PaginatedResult,
} from '../../common/pagination';
import {
  CreateOrganizationUseCase,
  ListUserOrganizationsUseCase,
} from './application';
import {
  CreateOrganizationDto,
  OrganizationListQueryDto,
  OrganizationListItemDto,
  OrganizationResponseDto,
} from './dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listUserOrganizationsUseCase: ListUserOrganizationsUseCase,
    private readonly cursorService: CursorService,
  ) {}

  @Post()
  @UseGuards(SessionGuard)
  @ApiOperation({
    summary: 'Create a new organization',
    description:
      'Creates a new organization and automatically adds the creator as a MANAGER member.',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization successfully created.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: { id: string },
  ): Promise<OrganizationResponseDto> {
    const organization = await this.createOrganizationUseCase.execute(
      dto.name,
      user.id,
      dto.description,
    );

    return OrganizationResponseDto.fromAggregate(organization);
  }

  @Get()
  @UseGuards(SessionGuard)
  @ApiOperation({
    summary: 'List all organizations for current user',
    description: 'Returns all organizations where the user is a member.',
  })
  @ApiPaginatedResponse(OrganizationListItemDto)
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  async list(
    @CurrentUser() user: { id: string },
    @Query() query: OrganizationListQueryDto,
  ): Promise<PaginatedResult<OrganizationListItemDto>> {
    const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
    let cursor = undefined;

    if (query.cursor) {
      try {
        cursor = this.cursorService.decode(query.cursor);
      } catch {
        throw new BadRequestException('Invalid cursor');
      }
    }

    return this.listUserOrganizationsUseCase.execute(user.id, {
      limit,
      cursor,
    });
  }
}
