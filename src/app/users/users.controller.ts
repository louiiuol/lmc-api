import {Controller, Get, UseGuards, Body, Patch, Query} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UsersService} from './users.service';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {User, UserViewDto, UserUpdateDto} from './types';

@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	@Get('me')
	async getProfile(@CurrentUser() user) {
		return await this.mapReturn(this.usersService.findOneByEmail(user.email));
	}

	@Patch('me')
	async updateUser(@Body() dto: UserUpdateDto, @CurrentUser() user) {
		return await this.mapReturn(this.usersService.update(user.uuid, dto));
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
