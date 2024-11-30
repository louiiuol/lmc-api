import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {environment} from 'src/app/environment';

import {User, UserCreateDto} from '@feat/users/types';
import {UsersService} from '@feat/users/users.service';

import {MailerService} from '@shared/modules/mail/mail.service';
import {TokenJWT} from './types';

import {createClient} from '@supabase/supabase-js';

@Injectable()
export class AuthService {
	private readonly supabase = createClient(
		process.env.SUPABASE_URL,
		process.env.SUPABASE_KEY
	);

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	signUp = async (dto: UserCreateDto): Promise<any> => {
		if (await this.usersService.findOneByEmail(dto.email))
			return 'Cette adresse email est déjà utilisée.';

		const {data, error} = await this.supabase.auth.signUp({
			email: dto.email,
			password: dto.password,
		});

		if (error) throw new BadRequestException(error.message);

		const {password, ...userInfo} = dto;

		const user = await this.usersService.save({
			...userInfo,
			supabaseUserId: data.user.id,
		});

		if (!user)
			throw new BadRequestException(
				"L'inscription à échoué. Réessayer plus tard."
			);

		await this.sendEmailConfirmation(user);
		return "Utilisateur inscrit avec succès. En attente de confirmation de l'email";
	};

	/**
	 * Log given user w/ JWT service and returns connexion token.
	 * * Also checks if account was closed, if so reopen it.
	 * @param user payload to log user in
	 * @returns JWT access token
	 */
	logIn = async (user: {
		email: string;
		password: string;
	}): Promise<TokenJWT> => {
		const entity = await this.usersService.findOneByEmail(user.email);
		if (!entity) throw new UnauthorizedException("Ce compte n'existe pas.");
		if (entity.closed) {
			entity.closed = false;
			entity.closedAt = null;
		}
		entity.lastConnection = new Date();
		await this.usersService.update(entity.uuid, entity);

		const {error, data} = await this.supabase.auth.signInWithPassword({
			email: user.email,
			password: user.password,
		});

		if (error) throw new UnauthorizedException(error.message);

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token,
		};
	};

	refreshTokens = async (refreshToken: string) => {
		const {data, error} = await this.supabase.auth.refreshSession({
			refresh_token: refreshToken,
		});

		if (error) throw new UnauthorizedException(error.message);

		const user = await this.usersService.findOneBySupabaseId(data.user.id);

		await this.usersService.update(user.uuid, {updatedAt: new Date()});

		return {
			refreshToken: data.session.refresh_token,
			accessToken: data.session.access_token,
		};
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
		password: string
	): Promise<Partial<User>> => {
		const user = await this.usersService.findOneByEmail(email);
		if (!user) throw new UnauthorizedException("Cet utilisateur n'existe pas.");
		if (!user.isActive) throw new ForbiddenException('Inactive account');
		const {error} = await this.supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw new UnauthorizedException(error.message);
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

	private checkToken = async (userId: string, token: any): Promise<boolean> => {
		try {
			return !!this.jwtService.verify(token, {
				secret:
					process.env.JWT_SECRET_KEY +
					(await this.usersService.findOneByUuid(userId)).uuid,
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
			{secret: process.env.JWT_SECRET_KEY + user.uuid, expiresIn: '1d'}
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
