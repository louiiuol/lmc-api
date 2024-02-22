import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from '../users/users.service';
import * as bcrypt from 'bcrypt';

import {TokenJWT} from './types';
import {User} from '../users/types/user.entity';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService
	) {}

	/**
	 * Log given user w/ JWT service and returns connexion token.
	 * * Also checks if account was closed, if so reopen it.
	 * @param user payload to log user in
	 * @returns JWT access token
	 */
	login = async (user: User): Promise<TokenJWT> => {
		const entity = await this.usersService.findOneByUuid(user.uuid);
		if (entity.closed) {
			entity.closed = false;
			entity.closedAt = null;
		}
		entity.lastConnection = new Date();
		await this.usersService.save(entity);
		return {
			accessToken: this.jwtService.sign({
				username: user.email,
				sub: user.uuid,
			}),
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
		pass: string
	): Promise<Partial<User>> => {
		const user = await this.usersService.findOneByEmail(email);
		if (!(user?.isActive && (await bcrypt.compare(pass, user.password))))
			return null;
		delete user.password;
		return user;
	};
}
