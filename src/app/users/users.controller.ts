import {Request, Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {User, UserViewDto} from './types';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UsersService} from './users.service';
import {CurrentUser} from '../auth/decorators/current-user.decorator';

@Controller()
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	async getProfile(@Request() req): Promise<UserViewDto> {
		const user = await this.usersService.findOneByEmail(req.user.email);
		console.log(user);
		return this.classMapper.map(user, User, UserViewDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses/next')
	async nextLesson(@CurrentUser() user) {
		console.log('next', user);
		return await this.usersService.nextLesson(user);
	}

	// TODO Update user

	// TODO Close account (archive user)
}
