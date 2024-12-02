import {ForbiddenException, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {environment} from 'src/app/environment';
import {UsersService} from './users.service';
import {PasswordResetDto} from './types';
import {MailerService} from '@shared/modules/mail/mail.service';

@Injectable()
export class UsersPasswordService {
	private readonly salt = Number(environment.SALT);
	constructor(
		private readonly users: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	/**
	 * Checks if the given password matches the encrypte password of the user associated (by the given uuid)
	 * @param uuid identifier of the user to be checked
	 * @param password encrypted password to compare
	 * @returns True if passwords match, false otherwise
	 */
	checkPassword = async (uuid: string, password: string): Promise<boolean> =>
		await bcrypt.compare(
			password,
			(
				await this.users.findOneByUuid(uuid)
			).password
		);

	/**
	 * Reset given user's password, if found. Will also checks for token validity.
	 * @param uuid identifier of the user
	 * @param dto input containing identification token and new password to update
	 * @returns confirmation string if operation was successful
	 * @throws ForbiddenException('token invalide')
	 */
	resetPassword = async (uuid: string, dto: PasswordResetDto) => {
		const user = await this.users.findOneByUuid(uuid);
		if (user) {
			try {
				this.jwtService.verify(dto.token, {
					secret: process.env.JWT_SECRET_KEY + user.password,
				});
				user.password = await this.hashPassword(dto.password);
				await this.users.update(uuid, user);
				return 'utilisateur mis à jour.';
			} catch (e) {
				throw new ForbiddenException(e, 'Token invalide');
			}
		}
	};

	updatePassword = async (uuid: string, password: string) =>
		await this.users.update(uuid, {
			password: await this.hashPassword(password),
		});

	forgotPassword = async (email: string) => {
		const user = await this.users.findOneByEmail(email);
		if (!user) return 'utilisateur inconnu';
		const token = this.jwtService.sign(
			{
				email,
				uuid: user.uuid,
			},
			{secret: process.env.JWT_SECRET_KEY + user.password, expiresIn: '15m'}
		);

		await this.mailerService.sendMail({
			recipient: email,
			title: 'Réinitialisez votre mot de passe',
			template: 'forgot-password',
			data: {
				summary:
					'Vous pouvez réinitialiser votre mot de pass en cliquant sur le lien ci-dessous.',
				link: `${environment.WEB_UI_URL}reset-password?user=${user.uuid}&token=${token}`,
			},
		});
		return 'email envoyé';
	};

	private hashPassword = async (password: string): Promise<string> =>
		await bcrypt.hash(password, this.salt);
}
