import {
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
	Query,
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
	PasswordUpdateDto,
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
	@Get('me')
	async getProfile(@CurrentUser() user) {
		return await this.mapReturn(this.usersService.findOneByEmail(user.email));
	}

	@UseGuards(JwtAuthGuard)
	@Patch('me')
	async updateUser(@Body() dto: UserUpdateDto, @CurrentUser() user) {
		return await this.mapReturn(this.usersService.updateUser(user.uuid, dto));
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

	@UseGuards(JwtAuthGuard)
	@Patch('update-password')
	@HttpCode(200)
	updatePassword(@CurrentUser() user, @Body() dto: PasswordUpdateDto) {
		return this.usersService.updatePassword(user.uuid, dto.password);
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses/next')
	async nextLesson(@CurrentUser() user, @Query() index: number) {
		return await this.usersService.setCurrentLessonIndex(user, index);
	}

	@UseGuards(JwtAuthGuard)
	@Get('close')
	async closeAccount(@CurrentUser() user) {
		return await this.usersService.closeAccount(user);
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);

	private checkIsAllowed(user: {uuid: string; role: string}, uuid: string) {
		if (!(user.role === 'ADMIN' || user.uuid === uuid))
			throw new ForbiddenException('ACTION_NOT_ALLOWED');
	}
}
