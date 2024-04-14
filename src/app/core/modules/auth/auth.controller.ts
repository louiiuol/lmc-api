import {
	Body,
	Param,
	Redirect,
	Query,
	BadRequestException,
	UnauthorizedException,
} from '@nestjs/common';
import {AuthService} from './auth.service';

import {environment} from 'src/app/environment';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Controller, Post, Get} from '@shared/decorators/rest';

import {UserCreateDto, User, UserLoginDto} from '@feat/users/types';
import {TokenJWT} from './types';

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
		return await this.authService.logIn(dto as User);
	}

	@Get({
		path: 'refresh',
		description: "Rafraîchissement des tokens d'identification.",
		restriction: 'refresh',
		returnType: TokenJWT,
	})
	refreshTokens(@CurrentUser() user) {
		const username = user['username'];
		const refreshToken = user['refreshToken'];
		if (!(username && refreshToken))
			throw new UnauthorizedException('Token invalide.');
		return this.authService.refreshTokens(username, refreshToken);
	}

	@Get({
		path: 'logout',
		description: "Déconnexion de l'utilisateur.",
		restriction: 'user',
	})
	logout(@CurrentUser() user) {
		const sub = user['sub'];
		return this.authService.logOut(sub);
	}

	@Get({
		path: 'close-account',
		description: 'Fermeture du compte.',
		restriction: 'user',
	})
	async closeAccount(@CurrentUser() user) {
		this.authService.logOut(user['sub']);
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
