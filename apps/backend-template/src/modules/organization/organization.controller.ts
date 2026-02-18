import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import { CreateOrganizationUseCase } from './application';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
} from './dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
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
    @CurrentUser() user: unknown,
  ): Promise<OrganizationResponseDto> {
    // Validate user context
    if (
      !user ||
      typeof user !== 'object' ||
      !('id' in user) ||
      typeof (user as { id: unknown }).id !== 'string'
    ) {
      throw new UnauthorizedException('Invalid user context');
    }

    // Log user info for debugging --- IGNORE ---
    console.log('Creating organization for user:', (user as { id: string }).id);

    const userId = (user as { id: string }).id;

    // Map DTO to primitives and execute use case
    const organization = await this.createOrganizationUseCase.execute(
      dto.name,
      userId,
      dto.description,
    );

    // Map aggregate to response DTO
    return OrganizationResponseDto.fromAggregate(organization);
  }
}
