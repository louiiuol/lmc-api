import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {environment} from '../environment';
import * as bcrypt from 'bcrypt';
import {MailerService} from '@nestjs-modules/mailer';
import {JwtService} from '@nestjs/jwt';
import {User, UserCreateDto, PasswordResetDto, UserUpdateDto} from './types';

@Injectable()
export class UsersService {
	private readonly salt = Number(environment.SALT);
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		private readonly mailerService: MailerService,
		private readonly jwtService: JwtService
	) {}

	/**
	 * Store User entity in database.
	 * @param user entity to be saved
	 */
	save = async (user: UserCreateDto): Promise<string> => {
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
							"Pour compléter l'inscription de votre compte, merci de cliquer sur le lien ci-dessous",
						link: `http://localhost:3333/api/users/${entity.uuid}/activate/?token=${token}`,
					},
				});
			}
		}
		return '🎉 Account created !';
	};

	checkToken = async (uuid: string, token: any): Promise<boolean> => {
		try {
			const user = await this.findOneByUuid(uuid);
			return !!this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET_KEY + user.password,
			});
		} catch (e) {
			throw new UnauthorizedException(e.message);
		}
	};

	findAll = (): Promise<User[]> => this.usersRepository.find();

	findOneByUuid = (uuid: string) => this.usersRepository.findOneBy({uuid});

	findOneByEmail = (email: string) =>
		this.usersRepository.findOne({
			where: {email},
		});

	remove = async (id: string) => await this.usersRepository.delete(id);

	nextLesson = async (user: User): Promise<number> => {
		const entity = await this.findOneByUuid(user.uuid);
		entity.currentLessonIndex++;
		return (await this.usersRepository.save(entity)).currentLessonIndex;
	};

	activateAccount = async (uuid: string, token: string) => {
		if (await this.checkToken(uuid, token)) {
			const entity = await this.findOneByUuid(uuid);
			await this.setUserActive(entity, true);
			return '🎉 Account activated !';
		} else return '❌ Invalid token !';
	};

	closeAccount = async (user: any) => {
		await this.setUserActive(user, false);
		return '🎉 Account closed !';
	};

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
					link: `http://localhost:4200/reset-password/${user.uuid}/${token}`,
				},
			});
		}
		return '🎉 Email sent !';
	};

	async updateUser(uuid: string, dto: UserUpdateDto) {
		return await this.usersRepository.update({uuid}, dto);
	}

	async resetPassword(uuid: string, dto: PasswordResetDto) {
		const user = await this.findOneByUuid(uuid);
		if (user) {
			try {
				this.jwtService.verify(dto.token, {
					secret: process.env.JWT_SECRET_KEY + user.password,
				});
				user.password = await this.hashPassword(dto.password);
				await this.usersRepository.update({uuid}, user);
				return '🎉 updated !';
			} catch (e) {
				const message = '❌ Invalid token !';
				console.error(message, e);
				throw new ForbiddenException(message);
			}
		}
	}

	async updatePassword(uuid: string, password: string) {
		const dto = {password: await this.hashPassword(password)};
		return await this.usersRepository.update({uuid}, dto);
	}

	hashPassword = async (password: string): Promise<string> =>
		await bcrypt.hash(password, this.salt);

	checkPassword = async (input: User, password: string): Promise<boolean> => {
		// TODO catch spam
		const user = await this.findOneByUuid(input.uuid);
		return await bcrypt.compare(password, user.password);
	};

	private setUserActive = async (user: User, active: boolean) => {
		const entity = await this.findOneByUuid(user.uuid);
		entity.isActive = active;
		await this.usersRepository.save(entity);
	};
}
