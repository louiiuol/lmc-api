import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { environment } from 'src/app/environment';

export type payloadType = { sub: string; username: string };

/**
 * Custom strategy implementing JWT strategy to valid current user authenticated with token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.JWT_SECRET_KEY,
    });
  }

  validate = (payload: payloadType) => ({
    uuid: payload.sub,
    email: payload.username,
  });
}
