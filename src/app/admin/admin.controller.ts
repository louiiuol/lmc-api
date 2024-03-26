import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import {LibraryService} from '../library/library.service';
import {UsersService} from '../users/users.service';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {AdminGuard} from '../auth/guards/roles/admin.guard';
import {FilteringParams, Filtering} from '../core/decorators/filtering-params';
import {
	PaginationParams,
	Pagination,
} from '../core/decorators/pagination-params';
import {SortingParams, Sorting} from '../core/decorators/sorting-params';
import {UserUpdateAdminDto} from '../users/types/dtos/user-update-admin.dto';
import {User, UserViewDto} from '../users/types';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {AdminUsersService} from './admin-users.service';
import {MailerService} from '@nestjs-modules/mailer';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
	constructor(
		private readonly libraryService: LibraryService,
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly usersService: UsersService,
		private readonly adminUsersService: AdminUsersService,
		private readonly mailerService: MailerService
	) {}

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

	@Get('export-emails')
	async exportEmails() {
		return await this.adminUsersService.exportEmails();
	}

	@Get('reset-subscription')
	async resetSubscription() {
		return await this.adminUsersService.resetSubscriptions();
	}

	@Patch('users/:uuid')
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

	@Post('courses')
	async generateLibrary() {
		await this.libraryService.createLibrary();
		return {
			code: 201,
			data: null,
			message: '🎉 Library successfully generated!',
		};
	}

	private mapReturn = async (promise: Promise<any>) =>
		this.classMapper.map(await promise, User, UserViewDto);
}
