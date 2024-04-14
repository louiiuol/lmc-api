import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {getOrder, getWhere, isXMonthEarlier} from 'src/app/shared/helpers';
import {UsersService} from '@feat/users/users.service';
import {MailerService} from '@shared/modules/mail/mail.service';
import {UserViewDto, UserRole, User} from '@feat/users/types';
import {Pagination, Filtering} from '@shared/decorators';
import {Sorting} from '@shared/decorators/params';
import {PaginatedResource} from '@shared/types/paginated-resource';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';

@Injectable()
export class AdminUsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly users: UsersService,
		private readonly mailerService: MailerService,
		@InjectMapper() private readonly classMapper: Mapper
	) {}

	resetSubscriptions = async () => {
		(await this.users.findAll())
			.map(user => {
				user.subscribed = false;
				return user;
			})
			.forEach(
				async user =>
					await this.users.update(user.uuid, {subscribed: user.subscribed})
			);
		return {message: 'SUBSCRIPTION_RESEATED'};
	};

	exportEmails = async () => ({
		emails: (await this.users.findAll()).map(user => user.email).join(', '),
	});

	/**
	 * Retrieves users form database based on given criteria.
	 * @param pagination sets limit, size, page size and offset of the page
	 * @param sort Property and direction to apply to the pagination
	 * @param filter property with rule (eq, lgt ...) and value to apply to the pagination
	 * @returns List of users with pagination configuration
	 */
	findAllPaginated = async (
		{page, limit, size, offset}: Pagination,
		sort?: Sorting,
		filters?: Filtering | Filtering[]
	): Promise<PaginatedResource<UserViewDto>> => {
		if (!Array.isArray(filters)) filters = [filters];
		const wheres = filters
			.map(f => getWhere(f))
			.reduce((prev, curr) => ({...prev, ...curr}), {});
		const [users, total] = await this.usersRepository.findAndCount({
			order: getOrder(sort),
			where: {
				...wheres,
				role: UserRole.USER,
			},
			take: limit,
			skip: offset,
		});

		return {
			totalItems: total,
			items: this.classMapper.mapArray(users, User, UserViewDto),
			page,
			size,
		};
	};

	@Cron('0 1 * * *')
	async handleClosedAccounts() {
		const members = {
			closed: [],
			removed: [],
		};

		(await this.users.findAll())
			.filter(u => u.closed && u.role === 'USER')
			.forEach(async user => {
				if (isXMonthEarlier(user.closedAt)) {
					members.closed.push(user);
					await this.mailerService.sendMail({
						recipient: user.email,
						title: 'Fermeture de votre compte.',
						template: 'closing-account',
						data: {
							summary:
								"Vous avez récemment demandé(e) la fermeture de votre compte. Celui-ci sera supprimé dans 1 mois. Si vous souhaitez rouvrir votre compte, il vous suffit de vous reconnecter à l'application",
						},
					});
				} else if (isXMonthEarlier(user.closedAt, 2)) {
					members.removed.push(user);
					await this.users.remove(user.uuid);
				}
			});
		/* const title = 'Cron Job running: Verifying closed account';
		const closed = members.closed.map(u => u.email).join(' - ');
		const removed = members.removed.map(u => u.email).join(' - '); */
	}

	async sendSubscriptionMail(email: string) {
		await this.mailerService.sendMail({
			recipient: email,
			title: 'Confirmation de votre abonnement à La Méthode claire.',
			template: 'sub-activated',
		});
	}
}
