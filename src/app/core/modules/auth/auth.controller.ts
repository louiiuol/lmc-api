import {
	BadRequestException,
	Body,
	Param,
	Query,
	Redirect,
	UnauthorizedException,
} from '@nestjs/common';
import {AuthService} from './auth.service';

import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Controller, Get, Post} from '@shared/decorators/rest';
import {environment} from 'src/app/environment';

import {UserCreateDto, UserLoginDto} from '@feat/users/types';
import {TokenJWT} from './types';
import {TokenRefreshDto} from './types/refresh-token.dto';

/**
 * Provides controller to handle user authentication
 */
@Controller({path: 'auth', name: 'Authentification'})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post({
		path: 'register',
		description: "Inscription d'un nouvel utilisateur.",
		body: UserCreateDto,
	})
	async register(@Body() dto: UserCreateDto) {
		return await this.authService.signUp(dto);
	}

	@Redirect(environment.WEB_UI_URL + 'login')
	@Get({
		path: 'users/:uuid/activate',
		description: 'Activation du compte renseigné en paramètre.',
	})
	async activateAccount(
		@Param('uuid') uuid: string,
		@Query('token') token: string
	) {
		if (!(uuid && token)) throw new UnauthorizedException('Token invalide.');
		return await this.authService.activateAccount(uuid, token);
	}

	@Post({
		path: 'login',
		code: 200,
		description: 'Récupération des identifiants de connexion.',
		body: UserLoginDto,
		returnType: TokenJWT,
		restriction: 'local',
	})
	async login(@Body() dto: UserLoginDto) {
		return await this.authService.logIn(dto);
	}

	@Post({
		path: 'refresh',
		description: "Rafraîchissement des tokens d'identification.",
		body: TokenRefreshDto,
		returnType: TokenJWT,
	})
	refreshTokens(@Body() dto: TokenRefreshDto) {
		return this.authService.refreshTokens(dto.refreshToken);
	}

	@Get({
		path: 'close-account',
		description: 'Fermeture du compte.',
		restriction: 'user',
	})
	async closeAccount(@CurrentUser() user) {
		return await this.authService.closeAccount(user.uuid);
	}

	@Get({
		path: 'account-reconfirmation/:email',
		description: "Demande de renvoi d'un email d'activation du compte.",
	})
	async reconfirmAccount(@Param('email') email: string) {
		if (!email) throw new BadRequestException("Le champ 'email' est requis.");
		return await this.authService.accountConfirmation(email);
	}
}
