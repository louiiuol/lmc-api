import {
	Request,
	Controller,
	Get,
	UseGuards,
	Body,
	Post,
	Param,
	Query,
	Redirect,
	HttpCode,
} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UsersService} from './users.service';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {environment} from '../environment';
import {
	User,
	PasswordForgotDto,
	PasswordResetDto,
	UserCreateDto,
	UserViewDto,
} from './types';

@Controller()
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	@Post('/register')
	async register(@Body() dto: UserCreateDto) {
		return await this.usersService.save(dto);
	}

	@Redirect(environment.WEB_UI_LOGIN_PATH)
	@Get('users/:uuid/activate')
	async activateAccount(@Query('token') token, @Param('uuid') uuid) {
		await this.usersService.activateAccount(uuid, token);
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getProfile(@Request() req): Promise<UserViewDto> {
		return this.classMapper.map(
			await this.usersService.findOneByEmail(req.user.email),
			User,
			UserViewDto
		);
	}

	// TODO Update user

	@Post('forgot-password')
	@HttpCode(200)
	forgotPassword(@Body() dto: PasswordForgotDto) {
		return this.usersService.forgotPassword(dto.email);
	}

	@Post('users/:uuid/reset-password')
	@HttpCode(200)
	resetPassword(@Body() dto: PasswordResetDto, @Param('uuid') uuid: string) {
		return this.usersService.resetPassword(uuid, dto);
	}

	@UseGuards(JwtAuthGuard)
	@Get('check-password')
	checkPassword(@Body() dto: {password: string}, @CurrentUser() user) {
		return this.usersService.checkPassword(user, dto.password);
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses/next')
	async nextLesson(@CurrentUser() user) {
		return await this.usersService.nextLesson(user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('close')
	async closeAccount(@CurrentUser() user) {
		return await this.usersService.closeAccount(user);
	}
}
