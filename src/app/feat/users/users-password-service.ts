import {ForbiddenException, Injectable, Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {MailerService} from '@shared/modules/mail/mail.service';
import {createClient} from '@supabase/supabase-js';
import {environment} from 'src/app/environment';
import {PasswordResetDto} from './types';
import {UsersService} from './users.service';

@Injectable()
export class UsersPasswordService {
	private readonly supabase = createClient(
		process.env.SUPABASE_URL,
		process.env.SUPABASE_KEY
	);
	constructor(
		private readonly users: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	/**
	 * Reset given user's password, if found. Will also checks for token validity.
	 * @param uuid identifier of the user
	 * @param dto input containing identification token and new password to update
	 * @returns confirmation string if operation was successful
	 * @throws ForbiddenException('token invalide')
	 */
	updatePasswordFromToken = async (uuid: string, dto: PasswordResetDto) => {
		const user = await this.users.findOneByUuid(uuid);
		if (user) {
			try {
				this.jwtService.verify(dto.token, {
					secret: process.env.JWT_SECRET_KEY + user.uuid,
				});
				await this.updateUserPassword(user.supabaseUserId, dto.password);

				return 'utilisateur mis à jour.';
			} catch (e) {
				throw new ForbiddenException(e, 'Token invalide');
			}
		}
	};

	updatePasswordFromLoggedUser = async (uuid: string, password: string) => {
		const user = await this.users.findOneByUuid(uuid);
		await this.updateUserPassword(user.supabaseUserId, password);
	};

	sendResetpasswordEmail = async (email: string) => {
		const user = await this.users.findOneByEmail(email);
		if (!user) return 'utilisateur inconnu';
		const token = this.jwtService.sign(
			{
				email,
				uuid: user.uuid,
			},
			{secret: process.env.JWT_SECRET_KEY + user.uuid, expiresIn: '2d'}
		);

		await this.mailerService.sendMail({
			recipient: email,
			title: 'Réinitialisez votre mot de passe',
			template: 'forgot-password',
			data: {
				summary:
					'Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous.',
				link: `${environment.WEB_UI_URL}/reset-password?user=${user.uuid}&token=${token}`,
			},
		});
		return 'email envoyé';
	};

	private updateUserPassword = async (id: string, password: string) => {
		const {error} = await this.supabase.auth.admin.updateUserById(id, {
			password,
		});
		if (error) Logger.error(error);
	};
}
