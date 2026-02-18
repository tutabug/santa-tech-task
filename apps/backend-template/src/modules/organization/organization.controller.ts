import {
  Body,
  Controller,
  Post,
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
    @CurrentUser() user: { id: string },
  ): Promise<OrganizationResponseDto> {
    const organization = await this.createOrganizationUseCase.execute(
      dto.name,
      user.id,
      dto.description,
    );

    return OrganizationResponseDto.fromAggregate(organization);
  }
}
