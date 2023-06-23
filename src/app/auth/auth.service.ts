import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from '../users/users.service';
import * as bcrypt from 'bcrypt';

import {TokenJWT} from './types';
import {User} from '../users/types/user.entity';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private mailerService: MailerService
	) {}

	/**
	 * Log given user w/ JWT service and returns connexion token.
	 * @param user payload to log user in
	 * @returns JWT access token
	 */
	login = (user: User): TokenJWT => ({
		accessToken: this.jwtService.sign({
			username: user.email,
			sub: user.uuid,
		}),
	});

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
		const user = await this.getCurrentUser(email);
		if (!(user?.isActive && (await bcrypt.compare(pass, user.password))))
			return null;
		delete user.password;
		return user;
	};

	getCurrentUser = async (email: string) =>
		await this.usersService.findOneByEmail(email);

	forgotPassword = async (email: string) => {
		const user = await this.getCurrentUser(email);
		if (user) {
			const secret = process.env.JWT_SECRET_KEY + user.password;
			const payload = {
				email,
				uuid: user.uuid,
			};
			const token = this.jwtService.sign(payload, {secret, expiresIn: '15m'});
			const link = `http://localhost:4200/reset-password/${user.uuid}/${token}`;

			this.mailerService.sendMail({
				to: email,
				subject: 'Réinitialisez votre mot de passe',
				html: `
				<h1>Vous avez oublié votre mot de passe ?</h1>
				<a href='${link}'>Réinitialiser votre mot de passe</a>`,
			});
		}
		return 'email sent (if account exists)';
	};

	async resetPassword(token: string, uuid: string, password: string) {
		const user = await this.usersService.findOneByUuid(uuid);
		if (user) {
			const secret = process.env.JWT_SECRET_KEY + user.password;
			try {
				this.jwtService.verify(token, {secret});
				user.password = password;
				this.usersService.save(user);
			} catch (e) {
				console.error(e);
			}
		}
	}
}
