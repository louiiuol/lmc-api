import {
	Request,
	Controller,
	Get,
	UseGuards,
	Body,
	Post,
	Param,
	Redirect,
	HttpCode,
	Patch,
	ForbiddenException,
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
	PasswordCheckDto,
	UserCreateDto,
	UserViewDto,
	UserUpdateDto,
} from './types';
import {QueryRequired} from '../core/decorators/required-query';

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
	async activateAccount(@QueryRequired('token') token, @Param('uuid') uuid) {
		await this.usersService.activateAccount(uuid, token);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('users/:uuid')
	async updateUser(
		@Body() dto: UserUpdateDto,
		@Param('uuid') uuid,
		@CurrentUser() user
	) {
		this.checkIsAllowed(user, uuid);
		return await this.mapReturn(this.usersService.updateUser(uuid, dto));
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getProfile(@CurrentUser() user) {
		return await this.mapReturn(this.usersService.findOneByEmail(user.email));
	}

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
	checkPassword(@Body() dto: PasswordCheckDto, @CurrentUser() user) {
		return this.usersService.checkPassword(user, dto.password);
	}

	// TODO Logged update password

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

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);

	private checkIsAllowed(user: {uuid: string; role: string}, uuid) {
		if (!(user.role === 'ADMIN' || user.uuid === uuid))
			throw new ForbiddenException('ACTION_NOT_ALLOWED');
	}
}
