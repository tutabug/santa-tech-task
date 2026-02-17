import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Auth, BETTER_AUTH } from './auth.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(@Inject(BETTER_AUTH) private readonly auth: Auth) {}

  @Post('sign-up')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() body: RegisterDto, @Req() req, @Res() res) {
    this.logger.log(`Register endpoint hit via API: ${req.url}`);

    try {
      const response = await this.auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
        asResponse: true,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const data = await response.json();

      if (response.status >= 400) {
        this.logger.error(`Better-Auth Error: ${JSON.stringify(data)}`);
      }

      return res.json(data);
    } catch (e) {
      this.logger.error('Unexpected error in sign-up', e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  @Post('sign-in')
  @Public()
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto, @Req() req, @Res() res) {
    this.logger.log(`Login endpoint hit via API: ${req.url}`);

    const response = await this.auth.api.signInEmail({
      body: {
        email: body.email,
        password: body.password,
      },
      asResponse: true,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const data = await response.json();

    if (response.status >= 400) {
      this.logger.error(`Better-Auth Error: ${JSON.stringify(data)}`);
    }

    return res.json(data);
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req, @Res() res) {
    const response = await this.auth.api.signOut({
      headers: req.headers,
      asResponse: true,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const data = await response.json();
    return res.json(data);
  }
}
