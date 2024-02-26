import {ForbiddenException, Injectable, Logger} from '@nestjs/common';
import {UsersService} from './users.service';
import {environment} from '../environment';
import {PasswordResetDto, User} from './types';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class UsersPasswordService {
	private readonly salt = Number(environment.SALT);
	constructor(
		private readonly users: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService
	) {}

	checkPassword = async (input: User, password: string): Promise<boolean> =>
		await bcrypt.compare(
			password,
			(
				await this.users.findOneByUuid(input.uuid)
			).password
		);

	resetPassword = async (uuid: string, dto: PasswordResetDto) => {
		const user = await this.users.findOneByUuid(uuid);
		if (user) {
			try {
				this.jwtService.verify(dto.token, {
					secret: process.env.JWT_SECRET_KEY + user.password,
				});
				user.password = await this.hashPassword(dto.password);
				await this.users.update(uuid, user);
				return {message: 'SUCCESS'};
			} catch (e) {
				const message = 'INVALID_TOKEN';
				Logger.error(message, e);
				throw new ForbiddenException(message);
			}
		}
	};

	updatePassword = async (uuid: string, password: string) =>
		await this.users.update(uuid, {
			password: await this.hashPassword(password),
		});

	forgotPassword = async (email: string) => {
		const user = await this.users.findOneByEmail(email);
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

	private hashPassword = async (password: string): Promise<string> =>
		await bcrypt.hash(password, this.salt);
}
