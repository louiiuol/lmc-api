import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {Body} from '@nestjs/common';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Controller, Get, PartialUpdate} from '@shared/decorators/rest';
import {User, UserUpdateDto, UserViewDto} from './types';
import {UsersService} from './users.service';

@Controller({name: 'Utilisateur connecté', path: 'me'})
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	@Get({
		description: "Récupération des informations de l'utilisateur connecté.",
		returnType: UserViewDto,
		restriction: 'user',
	})
	async getProfile(@CurrentUser() user) {
		return await this.mapReturn(this.usersService.findOneByEmail(user.email));
	}

	@PartialUpdate({
		description: "Mise à jour des informations de l'utilisateur connecté.",
		body: UserUpdateDto,
		returnType: UserViewDto,
		restriction: 'user',
	})
	async updateUser(@Body() dto: UserUpdateDto, @CurrentUser() user) {
		return await this.mapReturn(this.usersService.update(user.uuid, dto));
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
