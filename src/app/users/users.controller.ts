import {Request, Controller, Get, UseGuards, Body} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UsersService} from './users.service';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {UserCreateDto} from './types/dtos/user-create.dto';
import {UserViewDto} from './types/dtos/user-view.dto';
import {User} from './types/user.entity';
import {ApiTags} from '@nestjs/swagger';
import {Create} from 'src/app/core/decorators/create.decorator';

@Controller()
@ApiTags('User Controller')
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	/**
	 * Register new user if email is not taken
	 * @param dto
	 * @returns
	 */
	@Create({
		route: '/register',
		description: 'Register new user in database',
		successMessage: 'Successfully created new user',
	})
	async register(@Body() dto: UserCreateDto) {
		return await this.usersService.save(dto);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	async getProfile(@Request() req): Promise<UserViewDto> {
		return this.classMapper.map(
			await this.usersService.findOneByEmail(req.user.email),
			User,
			UserViewDto
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses/next')
	async nextLesson(@CurrentUser() user) {
		return await this.usersService.nextLesson(user);
	}

	// TODO Update user

	// TODO Close account (set active to false)
}
