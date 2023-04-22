import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { User, UserCreateDto, UserLoginDto } from '../users/types';
import { TokenJWT } from './types';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {}

  @Post('/register')
  async register(@Body() dto: UserCreateDto): Promise<void> {
    return await this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Body() dto: UserLoginDto): TokenJWT {
    return this.authService.login(dto as User);
  }

  // TODO Add password controller
  //* Forget password (send email if user exists)
  //* Reset password (w/ token from email => request from IHM)
  //* Update password (w/ currentPassword and current Token)
}
