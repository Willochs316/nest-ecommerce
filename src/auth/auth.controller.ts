import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from './guards/auth.guard';


@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('account/signup')
  async register(@Body() authPayload: AuthPayloadDto): Promise<{
    user: Omit<
      User,
      'password' | 'hashPassword' | 'hashNewPassword' | 'checkProfileComplete'
    >;
    token: string;
  }> {
    try {
      return await this.authService.createUser(authPayload);
    } catch (error) {
      console.error('Error during registration:', error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('account/verify-email/:token')
  async verifyEmail(@Param('token') token: string): Promise<Partial<User>> {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid token.');
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('account/login')
  async login(
    @Body() authPayload: AuthPayloadDto,
    @Req() req: Request,
  ): Promise<{ token: string }> {
    try {
      return await this.authService.login(authPayload);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    try {
      return await this.authService.requestPasswordReset(email);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // @Post('logout')
  // async logout(@Req() request: Request): Promise<{ message: string }> {
  //   const token = request.headers.authorization?.split(' ')[1]; // Bearer token

  //   // If no token is provided, return 401 Unauthorized
  //   if (!token) {
  //     throw new UnauthorizedException('Token required');
  //   }

  //   try {
  //     await this.authService.logout(token);
  //     return { message: 'Logout successful' };
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw new BadRequestException('Invalid token');
  //     }
  //     // For unhandled errors, throw InternalServerErrorException
  //     throw new InternalServerErrorException('Internal Server Error');
  //   }
  // }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
