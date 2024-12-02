import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {environment} from 'src/app/environment';
import {UsersService} from '@feat/users/users.service';

export type payloadType = {sub: string; username: string};

/**
 * Custom strategy implementing JWT strategy to valid current user authenticated with token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private users: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: environment.JWT_SECRET_KEY,
		});
	}

	validate = async (payload: payloadType) => {
		const user = await this.users.findOneByEmail(payload.username);
		if (!user) return null;
		return {
			uuid: user.uuid,
			email: payload.username,
			role: user.role,
		};
	};
}
