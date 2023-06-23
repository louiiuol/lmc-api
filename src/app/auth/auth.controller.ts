import {Controller, UseGuards, Body, Post, HttpCode} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local/local-auth.guard';
import {UserLoginDto} from '../users/types/dtos/user-login.dto';
import {User} from '../users/types/user.entity';
import {PasswordForgotDto, PasswordResetDto} from './types';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	@HttpCode(200)
	login(@Body() dto: UserLoginDto) {
		return {
			code: 200,
			data: this.authService.login(dto as User),
			message: '🎉 Successfully Logged in !',
		};
	}

	@Post('forgot-password')
	@HttpCode(200)
	forgotPassword(@Body() dto: PasswordForgotDto) {
		return this.authService.forgotPassword(dto.email);
	}

	@Post('reset-password')
	@HttpCode(200)
	resetPassword(@Body() dto: PasswordResetDto) {
		return this.authService.resetPassword(dto.token, dto.uuid, dto.password);
	}
}
