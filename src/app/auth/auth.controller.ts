import {Controller, UseGuards, Body, Post} from '@nestjs/common';
import {TokenJWT} from './types';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local/local-auth.guard';
import {UserLoginDto} from '../users/types/dtos/user-login.dto';
import {User} from '../users/types/user.entity';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	login(@Body() dto: UserLoginDto): TokenJWT {
		return this.authService.login(dto as User);
	}

	// TODO Add password methods
	// Forget password (send email if user exists)
	// Reset password (w/ token from email => request from IHM)
	// Update password (w/ currentPassword and current Token)
}
