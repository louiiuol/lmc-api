import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {environment} from 'src/app/environment';

import {User, UserCreateDto} from '@feat/users/types';
import {UsersService} from '@feat/users/users.service';

import {MailerService} from '@shared/modules/mail/mail.service';
import * as argon2 from 'argon2';
import {TokenJWT} from './types';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	signUp = async (dto: UserCreateDto): Promise<any> => {
		if (await this.usersService.findOneByEmail(dto.email))
			return 'Cette adresse email est déjà utilisé.';

		const user = await this.usersService.save({
			...dto,
			password: await this.hashData(dto.password),
		});
		if (!user) return "L'inscription à échoué. Réessayer plus tard.";

		await this.sendEmailConfirmation(user);
		const tokens = await this.getTokens(user.uuid, user.email);
		await this.updateRefreshToken(user.uuid, tokens.refreshToken);
		return "Utilisateur inscrit avec succès. En attente de confirmation de l'email";
	};

	/**
	 * Log given user w/ JWT service and returns connexion token.
	 * * Also checks if account was closed, if so reopen it.
	 * @param user payload to log user in
	 * @returns JWT access token
	 */
	logIn = async (user: {email: string; uuid?: string}): Promise<TokenJWT> => {
		const entity = await this.usersService.findOneByEmail(user.email);
		if (!entity) throw new UnauthorizedException("Ce compte n'existe pas.");
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
		if (!(await this.checkHash(refreshToken, user.refreshToken)))
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
		return 'Déconnexion effectuée avec succès';
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
		if (!user) throw new UnauthorizedException("Cet utilisateur n'existe pas.");
		if (!(await this.checkHash(pass, user.password))) return null;
		if (!user.isActive) throw new ForbiddenException('Inactive account');
		delete user.password;
		return user;
	};

	activateAccount = async (userId: string, token: string) => {
		if (await this.checkToken(userId, token)) {
			const entity = await this.usersService.findOneByUuid(userId);
			await this.setUserActive(entity, true);
			return 'Utilisateur activé';
		} else return 'Token invalide';
	};

	closeAccount = async (userId: string) => {
		const entity = await this.usersService.findOneByUuid(userId);
		entity.closed = true;
		entity.closedAt = new Date();
		await this.usersService.update(entity.uuid, entity);
		await this.mailerService.sendMail({
			recipient: entity.email,
			title: 'Fermeture de votre compte.',
			template: 'closing-account',
			data: {
				summary:
					"Vous venez de demander la fermeture de votre compte. Celui-ci sera supprimé dans 2 mois. Si vous souhaitez rouvrir votre compte, il vous suffit de vous reconnecter à l'application",
			},
		});
		return 'Compte fermé avec succès';
	};

	accountConfirmation = async (email: string) => {
		const user = await this.usersService.findOneByEmail(email);
		await this.sendEmailConfirmation(user);
		return 'Email envoyé';
	};

	private updateRefreshToken = async (userId: string, refreshToken: string) =>
		await this.usersService.update(userId, {
			refreshToken: await this.hashData(refreshToken),
		});

	hashData = async (plainText: string) => {
		try {
			return await argon2.hash(plainText);
		} catch (err) {
			throw new Error('Error hashing password');
		}
	};

	checkHash = async (plainText: string, hash: string) => {
		try {
			return await argon2.verify(hash, plainText);
		} catch (err) {
			throw new Error('Error checking password');
		}
	};

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

	private sendEmailConfirmation = async (user: User) => {
		const token = this.jwtService.sign(
			{
				username: user.email,
				sub: user.uuid,
			},
			{secret: process.env.JWT_SECRET_KEY + user.password, expiresIn: '1d'}
		);

		this.mailerService.sendMail({
			recipient: user.email,
			title: 'Bienvenue sur la méthode claire !',
			template: 'activate-account',
			data: {
				summary:
					"Pour compléter l'inscription de votre compte, merci de cliquer sur le lien ci-dessous. Ce lien est valide pour 1 journée.",
				link: `${environment.API_HOST_FULL}/api/auth/users/${user.uuid}/activate?token=${token}`,
			},
		});
	};
}
