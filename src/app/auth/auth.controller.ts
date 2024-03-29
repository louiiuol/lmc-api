import {
	Controller,
	UseGuards,
	Body,
	Post,
	HttpCode,
	Get,
	Req,
	Param,
	Redirect,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local/local-auth.guard';
import {UserLoginDto} from '../users/types/dtos/user-login.dto';
import {User} from '../users/types/user.entity';
import {RefreshTokenGuard} from './guards/jwt/jwt-refresh.guard';
import {UserCreateDto} from '../users/types/dtos/user-create.dto';
import {JwtAuthGuard} from './guards/jwt/jwt-auth.guard';
import {QueryRequired} from '../core/decorators/required-query';
import {environment} from '../environment';
import {CurrentUser} from './decorators/current-user.decorator';
//import {ApiTags} from '@nestjs/swagger';

/**
 * Provides controller to handle user authentication
 */
@Controller('auth')
//@ApiTags('Authentification')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() dto: UserCreateDto) {
		return await this.authService.signUp(dto);
	}

	@Redirect(environment.WEB_UI_URL + 'login')
	@Get('users/:uuid/activate')
	async activateAccount(@QueryRequired('token') token, @Param('uuid') uuid) {
		await this.authService.activateAccount(uuid, token);
	}

	@UseGuards(LocalAuthGuard)
	@Post('login')
	@HttpCode(200)
	async login(@Body() dto: UserLoginDto) {
		return {
			code: 200,
			data: await this.authService.logIn(dto as User),
			message: '🎉 Successfully Logged in !',
		};
	}

	@UseGuards(RefreshTokenGuard)
	@Get('refresh')
	refreshTokens(@Req() req) {
		const username = req.user['username'];
		const refreshToken = req.user['refreshToken'];
		return this.authService.refreshTokens(username, refreshToken);
	}

	@UseGuards(JwtAuthGuard)
	@Get('logout')
	logout(@Req() req) {
		return this.authService.logOut(req.user['sub']);
	}

	@UseGuards(JwtAuthGuard)
	@Get('close-account')
	async closeAccount(@CurrentUser() user) {
		this.authService.logOut(user['sub']);
		return await this.authService.closeAccount(user.uuid);
	}

	@Get('account-reconfirmation/:email')
	async reconfirmAccount(@Param('email') email: string) {
		await this.authService.accountConfirmation(email);
		return {message: 'Email sent!'};
	}
}
