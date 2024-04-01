import {Controller, Get, UseGuards, Body, Patch} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UsersService} from './users.service';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {User, UserViewDto, UserUpdateDto} from './types';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import {Fetch} from '../core/decorators/rest/fetch.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('User level access')
@ApiTags('Utilisateur connecté')
@Controller()
export class UsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService
	) {}

	// @ApiOperation({
	// 	summary: "Récupération des informations de l'utilisateur courant.",
	// })
	// @ApiResponse({
	// 	status: 403,
	// 	description:
	// 		'Vous ne disposez pas des accès pour accéder à cette ressource',
	// })
	// @ApiResponse({
	// 	status: 200,
	// 	description: 'Récupération effectuée avec succès',
	// 	type: UserViewDto,
	// })

	@Fetch({
		path: 'me',
		description: "Récupération des informations de l'utilisateur courant.",
		success:
			"Récupération des informations de l'utilisateur effectué avec succès",
		returnType: UserViewDto,
		level: 'user',
	})
	async getProfile(@CurrentUser() user) {
		return await this.mapReturn(this.usersService.findOneByEmail(user.email));
	}

	@ApiBody({type: UserUpdateDto})
	@Patch('me')
	async updateUser(@Body() dto: UserUpdateDto, @CurrentUser() user) {
		return await this.mapReturn(this.usersService.update(user.uuid, dto));
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
