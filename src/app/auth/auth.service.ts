import {
	ConflictException,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from '../users/users.service';
import * as bcrypt from 'bcrypt';

import {TokenJWT} from './types';
import {User} from '../users/types/user.entity';
import {environment} from '../environment';
import {UserCreateDto} from '../users/types';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
	private readonly salt = Number(environment.SALT);
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	signUp = async (dto: UserCreateDto): Promise<any> => {
		if (await this.usersService.findOneByEmail(dto.email))
			throw new ConflictException('Email already exists');
		const user = await this.usersService.save({
			...dto,
			password: this.hashData(dto.password),
		});
		if (user) {
			const token = this.jwtService.sign(
				{
					email: user.email,
					uuid: user.uuid,
				},
				{secret: process.env.JWT_SECRET_KEY + user.password, expiresIn: '15m'}
			);
			const title = 'Bienvenue sur la méthode claire !';
			this.mailerService.sendMail({
				to: user.email,
				subject: title,
				template: 'activate-account',
				context: {
					title,
					summary:
						"Pour compléter l'inscription de votre compte, merci de cliquer sur le lien ci-dessous. Ce lien expirera dans 15 minutes.",
					link: `${environment.API_HOST_FULL}/api/auth/users/${user.uuid}/activate?token=${token}`,
				},
			});
		}
		const tokens = await this.getTokens(user.uuid, user.email);
		await this.updateRefreshToken(user.uuid, tokens.refreshToken);
		return {message: 'User registered! Waiting for email confirmation.'};
	};

	/**
	 * Log given user w/ JWT service and returns connexion token.
	 * * Also checks if account was closed, if so reopen it.
	 * @param user payload to log user in
	 * @returns JWT access token
	 */
	logIn = async (user: User): Promise<TokenJWT> => {
		const entity = await this.usersService.findOneByEmail(user.email);
		if (entity.closed) {
			entity.closed = false;
			entity.closedAt = null;
		}
		entity.lastConnection = new Date();
		await this.usersService.update(user.uuid, entity);

		const tokens = await this.getTokens(user.uuid, user.email);
		await this.updateRefreshToken(entity.uuid, tokens.refreshToken);
		return tokens;
	};

	refreshTokens = async (email: string, refreshToken: string) => {
		const user = await this.usersService.findOneByEmail(email);

		if (!user?.refreshToken)
			throw new ForbiddenException(
				'Access Denied: No refresh token available !'
			);
		if (!(await bcrypt.compare(refreshToken, user.refreshToken)))
			throw new ForbiddenException('Access Denied: Invalid token!');

		const tokens = await this.getTokens(user.uuid, user.email);
		const updated = await this.updateRefreshToken(
			user.uuid,
			tokens.refreshToken
		);
		updated.lastConnection = new Date();
		this.usersService.update(user.uuid, updated);
		return tokens;
	};

	logOut = (userId: string) => {
		this.usersService.update(userId, {refreshToken: null});
		return {message: 'Logged out successfully.'};
	};

	/**
	 * Validate current credentials:
	 * * Finds user in database
	 * * Compare brcypt hash comparaison
	 * * remove password
	 * @returns user entity stored in database (password removed)
	 */
	validateUser = async (
		email: string,
		pass: string
	): Promise<Partial<User>> => {
		const user = await this.usersService.findOneByEmail(email);
		if (!(user?.isActive && (await bcrypt.compare(pass, user.password))))
			return null;
		delete user.password;
		return user;
	};

	activateAccount = async (userId: string, token: string) => {
		if (await this.checkToken(userId, token)) {
			const entity = await this.usersService.findOneByUuid(userId);
			await this.setUserActive(entity, true);
			return {message: 'SUCCESS'};
		} else return {message: 'INVALID_TOKEN'};
	};

	closeAccount = async (userId: string) => {
		const entity = await this.usersService.findOneByUuid(userId);
		entity.closed = true;
		entity.closedAt = new Date();
		await this.usersService.update(entity.uuid, entity);
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

	private updateRefreshToken = async (userId: string, refreshToken: string) =>
		await this.usersService.update(userId, {
			refreshToken: this.hashData(refreshToken),
		});

	private hashData = (data: string): string => bcrypt.hash(data, this.salt);

	private getTokens = async (userId: string, username: string) => {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
				{
					sub: userId,
					username,
				},
				{
					secret: environment.JWT_ACCESS_SECRET,
					expiresIn: '1d',
				}
			),
			this.jwtService.signAsync(
				{
					sub: userId,
					username,
				},
				{
					secret: environment.JWT_REFRESH_SECRET,
					expiresIn: '15d',
				}
			),
		]);

		return {
			accessToken,
			refreshToken,
		};
	};

	private checkToken = async (userId: string, token: any): Promise<boolean> => {
		try {
			return !!this.jwtService.verify(token, {
				secret:
					process.env.JWT_SECRET_KEY +
					(await this.usersService.findOneByUuid(userId)).password,
			});
		} catch (e) {
			throw new UnauthorizedException(e.message);
		}
	};

	private setUserActive = async (user: User, active: boolean) => {
		const entity = await this.usersService.findOneByUuid(user.uuid);
		entity.isActive = active;
		await this.usersService.update(entity.uuid, entity);
	};
}
