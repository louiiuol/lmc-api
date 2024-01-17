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
	Query,
	Put,
	Logger,
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
import {AdminGuard} from '../auth/guards/roles/admin.guard';
import {UserUpdateAdminDto} from './types/dtos/user-update-admin.dto';
import {FilteringParams, Filtering} from '../core/decorators/filtering-params';
import {
	PaginationParams,
	Pagination,
} from '../core/decorators/pagination-params';
import {SortingParams, Sorting} from '../core/decorators/sorting-params';

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

	@Redirect(environment.WEB_UI_URL + 'login')
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

	@Put('users/:uuid/reset-password')
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
	@Patch('courses/currentLesson')
	async setCurrentLesson(@CurrentUser() user, @Query('index') index: number) {
		return await this.usersService.setCurrentLessonIndex(user, index);
	}

	@UseGuards(JwtAuthGuard)
	@Get('close')
	async closeAccount(@CurrentUser() user) {
		return await this.usersService.closeAccount(user);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get('users')
	async findAll(
		@PaginationParams() paginationParams: Pagination,
		@SortingParams([
			'email',
			'firstName',
			'lastName',
			'isActive',
			'subscribed',
			'role',
			'createdAt',
			'currentLessonIndex',
			'newsletter',
		])
		sort?: Sorting,
		@FilteringParams([
			'isActive',
			'subscribed',
			'firstName',
			'lastName',
			'email',
		])
		filter?: Filtering
	) {
		Logger.log(filter);
		return this.usersService.findAllPaginated(paginationParams, sort, filter);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Patch('users/:uuid')
	async updateUserAsAdmin(
		@Param('uuid') uuid: string,
		@Body() dto: UserUpdateAdminDto
	) {
		return await this.mapReturn(this.usersService.updateUser(uuid, dto));
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get('reset-subscription')
	async resetSubscription() {
		return await this.usersService.resetSubscription();
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get('export-emails')
	async exportEmails() {
		return await this.usersService.exportEmails();
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
