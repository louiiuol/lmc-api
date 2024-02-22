import {
	ForbiddenException,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {environment} from '../environment';
import * as bcrypt from 'bcrypt';
import {MailerService} from '@nestjs-modules/mailer';
import {JwtService} from '@nestjs/jwt';
import {
	User,
	UserCreateDto,
	PasswordResetDto,
	UserUpdateDto,
	UserViewDto,
} from './types';
import {UserUpdateAdminDto} from './types/dtos/user-update-admin.dto';
import {Filtering} from '../core/decorators/filtering-params';
import {Pagination} from '../core/decorators/pagination-params';
import {Sorting} from '../core/decorators/sorting-params';
import {getWhere, getOrder} from '../core/helpers/type-orm-helpers.fn';
import {PaginatedResource} from '../core/types/paginated-resource';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {Cron} from '@nestjs/schedule';
import {isXMonthEarlier} from '../core/helpers';

@Injectable()
export class UsersService {
	private readonly salt = Number(environment.SALT);
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectMapper() private readonly classMapper: Mapper,
		private readonly mailerService: MailerService,
		private readonly jwtService: JwtService
	) {}

	/**
	 * Store User entity in database.
	 * @param user entity to be saved
	 */
	save = async (user: UserCreateDto) => {
		if (!(await this.findOneByEmail(user.email))) {
			user.password = await this.hashPassword(user.password);
			const entity = await this.usersRepository.save(user);
			if (user) {
				const token = this.jwtService.sign(
					{
						email: entity.email,
						uuid: entity.uuid,
					},
					{secret: process.env.JWT_SECRET_KEY + user.password, expiresIn: '15m'}
				);
				const title = 'Bienvenue sur la méthode claire !';
				this.mailerService.sendMail({
					to: entity.email,
					subject: title,
					template: 'activate-account',
					context: {
						title,
						summary:
							"Pour compléter l'inscription de votre compte, merci de cliquer sur le lien ci-dessous. Ce lien expirera dans 15 minutes.",
						link: `${environment.API_HOST_FULL}/api/users/${entity.uuid}/activate?token=${token}`,
					},
				});
			}
		}
		return {message: 'SUCCESS'};
	};

	findAll = async () =>
		this.classMapper.mapArray(
			await this.usersRepository.find(),
			User,
			UserViewDto
		);

	findAllPaginated = async (
		{page, limit, size, offset}: Pagination,
		sort?: Sorting,
		filter?: Filtering
	): Promise<PaginatedResource<UserViewDto>> => {
		const where = getWhere(filter);
		const order = getOrder(sort);

		const [users, total] = await this.usersRepository.findAndCount({
			where,
			order,
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

	findOneByUuid = async (uuid: string) => {
		const user = await this.usersRepository.findOne({where: {uuid}});
		Logger.log(uuid, user);
		return user;
	};

	findOneByEmail = async (email: string) =>
		await this.usersRepository.findOne({
			where: {email},
		});

	remove = async (id: string) => await this.usersRepository.delete(id);

	setCurrentLessonIndex = async (
		user: User,
		index: number
	): Promise<number> => {
		const entity = await this.findOneByUuid(user.uuid);
		entity.currentLessonIndex = index;
		return (await this.usersRepository.save(entity)).currentLessonIndex;
	};

	activateAccount = async (uuid: string, token: string) => {
		if (await this.checkToken(uuid, token)) {
			const entity = await this.findOneByUuid(uuid);
			await this.setUserActive(entity, true);
			return 'SUCCESS';
		} else return 'INVALID_TOKEN';
	};

	closeAccount = async (uuid: string) => {
		const entity = await this.findOneByUuid(uuid);
		entity.closed = true;
		entity.closedAt = new Date();
		await this.usersRepository.save(entity);
		const title = 'Fermeture de votre compte.';
		this.mailerService.sendMail({
			to: entity.email,
			subject: title,
			template: 'closing-account',
			context: {
				title,
				summary:
					"Vous venez de demander la fermeture de votre compte. Celui-ci sera supprimé dans 2 mois. Si vous souhaitez rouvrir votre compte, il vous suffit de vous reconnecter à l'application",
			},
		});
		return {message: 'account-closed'};
	};

	@Cron('0 1 * * *')
	async handleClosedAccounts() {
		(await this.usersRepository.find())
			.filter(u => u.closed && u.role === 'USER')
			.forEach(async user => {
				if (isXMonthEarlier(user.closedAt)) {
					const title = 'Fermeture de votre compte.';
					this.mailerService.sendMail({
						to: user.email,
						subject: title,
						template: 'closing-account',
						context: {
							title,
							summary:
								"Vous avez récemment demandé(e) la fermeture de votre compte. Celui-ci sera supprimé dans 1 mois. Si vous souhaitez rouvrir votre compte, il vous suffit de vous reconnecter à l'application",
						},
					});
				} else if (isXMonthEarlier(user.closedAt, 2)) {
					await this.usersRepository.delete({uuid: user.uuid});
				}
			});
	}

	async activateSubscription(uuid: string, valid: boolean) {
		const user = await this.findOneByUuid(uuid);
		user.subscribed = valid;
		this.save(user);
		return 'SUBSCRIPTION_UPDATED';
	}

	forgotPassword = async (email: string) => {
		const user = await this.findOneByEmail(email);
		if (user) {
			const token = this.jwtService.sign(
				{
					email,
					uuid: user.uuid,
				},
				{secret: process.env.JWT_SECRET_KEY + user.password, expiresIn: '15m'}
			);
			const title = 'Réinitialisez votre mot de passe';
			this.mailerService.sendMail({
				to: email,
				subject: title,
				template: 'forgot-password',
				context: {
					title,
					summary:
						'Vous pouvez réinitialiser votre mot de pass en cliquant sur le lien ci-dessous.',
					link: `${environment.WEB_UI_URL}reset-password?user=${user.uuid}&token=${token}`,
				},
			});
		}
		return {message: 'SUCCESS'};
	};

	updateUser = async (
		uuid: string,
		dto: UserUpdateDto | UserUpdateAdminDto
	) => {
		const user = await this.findOneByUuid(uuid);
		if (user && 'subscribed' in dto && dto.subscribed && !user.subscribed) {
			Logger.log('sending mail');
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
		return this.classMapper.map(
			await this.usersRepository.save({...user, ...dto}),
			User,
			UserViewDto
		);
	};

	resetPassword = async (uuid: string, dto: PasswordResetDto) => {
		const user = await this.findOneByUuid(uuid);
		if (user) {
			try {
				this.jwtService.verify(dto.token, {
					secret: process.env.JWT_SECRET_KEY + user.password,
				});
				user.password = await this.hashPassword(dto.password);
				await this.usersRepository.update({uuid}, user);
				return {message: 'SUCCESS'};
			} catch (e) {
				const message = 'INVALID_TOKEN';
				console.error(message, e);
				throw new ForbiddenException(message);
			}
		}
	};

	updatePassword = async (uuid: string, password: string) =>
		await this.usersRepository.update(
			{uuid},
			{password: await this.hashPassword(password)}
		);

	checkPassword = async (input: User, password: string): Promise<boolean> => {
		// TODO catch spam (only current user can check his own password)
		const user = await this.findOneByUuid(input.uuid);
		return await bcrypt.compare(password, user.password);
	};

	async resetSubscription() {
		(await this.usersRepository.find())
			.map(user => {
				user.subscribed = false;
				return user;
			})
			.forEach(async user => await this.usersRepository.save(user));
		return {message: 'SUBSCRIPTION_RESEATED'};
	}

	async exportEmails() {
		return {
			emails: (await this.usersRepository.find())
				.map(user => user.email)
				.join(', '),
		};
	}

	private hashPassword = async (password: string): Promise<string> =>
		await bcrypt.hash(password, this.salt);

	private checkToken = async (uuid: string, token: any): Promise<boolean> => {
		try {
			return !!this.jwtService.verify(token, {
				secret:
					process.env.JWT_SECRET_KEY +
					(await this.findOneByUuid(uuid)).password,
			});
		} catch (e) {
			throw new UnauthorizedException(e.message);
		}
	};

	private setUserActive = async (user: User, active: boolean) => {
		const entity = await this.findOneByUuid(user.uuid);
		entity.isActive = active;
		await this.usersRepository.save(entity);
	};

	private isOlderThan = (date: Date, days: number) =>
		new Date(date).getTime() - new Date().getTime() <
		days * 60 * 60 * 24 * 1000;
}
