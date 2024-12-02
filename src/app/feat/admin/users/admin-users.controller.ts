import {Body, Param} from '@nestjs/common';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {
	PaginationParams,
	Pagination,
	FilteringParams,
	Filtering,
	SortingParams,
	Sorting,
} from '@shared/decorators/params';
import {UsersService} from '@feat/users/users.service';
import {User, UserViewDto, UserUpdateAdminDto} from '@feat/users/types';
import {Controller, Get, PartialUpdate} from '@shared/decorators/rest';
import {AdminUsersService} from './admin-users.service';

@Controller({path: 'admin', name: 'Back Office (Gestion des utilisateurs)'})
export class AdminUsersController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService,
		private readonly adminUserService: AdminUsersService
	) {}

	@Get({
		path: 'users',
		description:
			"Récupération de l'ensemble des utilisateurs. Système de filtres, tri, et pagination intégré.",
		returnType: UserViewDto,
		withPagination: true,
		restriction: 'admin',
	})
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
			'lastConnection',
		])
		sort?: Sorting,
		@FilteringParams([
			'isActive',
			'subscribed',
			'firstName',
			'lastName',
			'email',
		])
		filter?: Filtering[]
	) {
		return this.adminUserService.findAllPaginated(
			paginationParams,
			sort,
			filter
		);
	}

	@Get({
		path: 'export-emails',
		description:
			"Récupération de l'ensemble des adresses email des utilisateurs de l'application",
		restriction: 'admin',
	})
	async exportEmails() {
		return await this.adminUserService.exportEmails();
	}

	@Get({
		path: 'reset-subscription',
		description: "Réinitialise l'ensemble des abonnements.",
		restriction: 'admin',
	})
	async resetSubscription() {
		return await this.adminUserService.resetSubscriptions();
	}

	@PartialUpdate({
		path: 'users/:uuid',
		description:
			"Mise à jour des informations d'un utilisateur. Permet notamment d'activer ou désactiver le compte ou l'abonnement de l'utilisateur.",
		body: UserUpdateAdminDto,
		returnType: UserViewDto,
		restriction: 'admin',
	})
	async updateUserAsAdmin(
		@Param('uuid') uuid: string,
		@Body() dto: UserUpdateAdminDto
	) {
		return await this.mapReturn(this.usersService.update(uuid, dto));
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
