import {Body, Param} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {FilteringParams, Filtering} from '@shared/decorators/filtering-params';
import {
	PaginationParams,
	Pagination,
} from '@shared/decorators/pagination-params';
import {SortingParams, Sorting} from '@shared/decorators/sorting-params';
import {UsersService} from '@feat/users/users.service';
import {User, UserViewDto, UserUpdateAdminDto} from '@feat/users/types';
import {Controller, Get, PartialUpdate} from '@shared/decorators/rest';
import {AdminUsersService} from './admin-users.service';

@Controller({path: 'admin', name: 'Back Office'})
export class AdminController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService,
		private readonly adminUserService: AdminUsersService,
		private readonly mailerService: MailerService
	) {}

	// TODO Add swagger for filters etc ..
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
		return this.usersService.findAllPaginated(paginationParams, sort, filter);
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

	// @Get('reset-subscription')
	// async resetSubscription() {
	// 	return await this.adminUsersService.resetSubscriptions();
	// }

	@PartialUpdate({
		path: 'users/:uuid',
		description:
			"Mise à jour des informations d'un utilisateur. Permet notamment d'activer ou désactiver le compte ou l'abonnement de l'utilisateur.",
		body: UserUpdateAdminDto,
		restriction: 'admin',
	})
	async updateUserAsAdmin(
		@Param('uuid') uuid: string,
		@Body() dto: UserUpdateAdminDto
	) {
		const user = await this.mapReturn(this.usersService.update(uuid, dto));
		if ('subscribed' in dto && dto.subscribed) {
			const title = 'Confirmation de votre abonnement à La Méthode claire.';
			this.mailerService.sendMail({
				to: user.email,
				subject: title,
				template: 'sub-activated',
				context: {
					title,
				},
			});
		}
	}

	// @Post('courses')
	// async generateLibrary() {
	// 	await this.libraryService.createLibrary();
	// 	return {
	// 		code: 201,
	// 		data: null,
	// 		message: '🎉 Library successfully generated!',
	// 	};
	// }

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
