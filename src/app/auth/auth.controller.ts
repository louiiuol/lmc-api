import {
	Controller,
	UseGuards,
	Body,
	Post,
	HttpStatus,
	HttpCode,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local/local-auth.guard';
import {UserLoginDto} from '../users/types/dtos/user-login.dto';
import {User} from '../users/types/user.entity';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	@HttpCode(200)
	login(@Body() dto: UserLoginDto) {
		const token = this.authService.login(dto as User);
		return {
			code: 200,
			data: token,
			message: '🎉 Successfully Logged in !',
		};
	}

	// TODO Add password methods
	// Forget password (send email if user exists)
	// Reset password (w/ token from email => request from IHM)
	// Update password (w/ currentPassword and current Token)
}
