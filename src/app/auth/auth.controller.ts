import {Controller, UseGuards, Body, Post, HttpCode} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local/local-auth.guard';
import {UserLoginDto} from '../users/types/dtos/user-login.dto';
import {User} from '../users/types/user.entity';

/**
 * Provides controller to handle user authentication
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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

	// TODO Refresh token
}
