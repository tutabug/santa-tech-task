import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import {
  ApiPaginatedResponse,
  CursorDecodePipe,
  PaginatedResult,
  PaginationQuery,
} from '../../common/pagination';
import {
  CreateOrganizationUseCase,
  ListOrganizationMembersUseCase,
  ListUserOrganizationsUseCase,
} from './application';
import { OrganizationRole } from './domain';
import {
  CreateOrganizationDto,
  OrganizationListItemDto,
  OrganizationMemberListItemDto,
  OrganizationResponseDto,
} from './dto';
import { OrganizationRoleGuard, RequireOrgRole } from './guards';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationMembersUseCase: ListOrganizationMembersUseCase,
    private readonly listUserOrganizationsUseCase: ListUserOrganizationsUseCase,
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
    @Query(CursorDecodePipe) query: PaginationQuery,
  ): Promise<PaginatedResult<OrganizationListItemDto>> {
    return this.listUserOrganizationsUseCase.execute(user.id, query);
  }

  @Get(':id/members')
  @UseGuards(SessionGuard, OrganizationRoleGuard)
  @RequireOrgRole(OrganizationRole.MANAGER)
  @ApiOperation({
    summary: 'List all members of an organization',
    description:
      'Returns all members of the organization. Only accessible by managers.',
  })
  @ApiPaginatedResponse(OrganizationMemberListItemDto)
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @ApiResponse({ status: 403, description: 'User is not a manager of this organization.' })
  async listMembers(
    @Param('id') organizationId: string,
    @Query(CursorDecodePipe) query: PaginationQuery,
  ): Promise<PaginatedResult<OrganizationMemberListItemDto>> {
    return this.listOrganizationMembersUseCase.execute(organizationId, query);
  }
}
