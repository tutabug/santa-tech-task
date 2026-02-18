import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionGuard } from '../../common/guards/session.guard';
import { UserApplicationService } from './application';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userAppService: UserApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (internal)' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // Map DTO to primitives (boundary: presentation -> application)
    const user = await this.userAppService.createUser(dto.email, dto.name);
    // Map aggregate to DTO (boundary: domain -> presentation)
    return UserResponseDto.fromAggregate(user);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return current user profile.',
    type: UserResponseDto,
  })
  async getProfile(
    @CurrentUser() user: { id: string },
  ): Promise<UserResponseDto> {
    // User validation handled by SessionGuard
    const domainUser = await this.userAppService.getUserById(user.id);
    return UserResponseDto.fromAggregate(domainUser);
  }

  @Get()
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userAppService.getAllUsers();
    return users.map((user) => UserResponseDto.fromAggregate(user));
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userAppService.getUserById(id);
    return UserResponseDto.fromAggregate(user);
  }
}
