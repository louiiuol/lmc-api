import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import { TokenJWT } from './types';
import { User, UserCreateDto } from '../users/types';
import { environment } from '../environment';

@Injectable()
export class AuthService {
  private readonly salt = Number(environment.SALT);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Store User entity in database.
   * @param user entity to be saved
   */
  register = async (user: UserCreateDto): Promise<void> => {
    user.password = await bcrypt.hash(user.password, this.salt);
    await this.usersService.save(user);
  };

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
    pass: string,
  ): Promise<Partial<User>> => {
    const user = await this.getCurrentUser(email);
    if (!(user && user.isActive && (await bcrypt.compare(pass, user.password))))
      return null;
    delete user.password;
    return user;
  };

  getCurrentUser = async (email: string) =>
    await this.usersService.findOneByEmail(email);
}
