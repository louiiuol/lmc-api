import {AuthService} from '@core/modules/auth/auth.service';
import {User} from '@feat/users/types/user.entity';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';

/**
 * Customized strategy to valide user when he request authenticated ressource
 * with given credentials (email/password)
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({usernameField: 'email'});
	}

	/**
	 * Checks if current user's credentials are valid, and returns the entity.
	 * Otherwise, throws an UnauthorizedException
	 * @param email user's identifier
	 * @param password user's password (must match stored pass)
	 * @returns User entity from database
	 */
	async validate(email: string, password: string): Promise<Partial<User>> {
		const user = await this.authService.validateUser(email, password);
		if (!user) throw new UnauthorizedException();
		return user;
	}
}
