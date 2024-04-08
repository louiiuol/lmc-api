import {Body, Req, Param, Redirect, Query} from '@nestjs/common';
import {AuthService} from './auth.service';

import {environment} from 'src/app/environment';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Controller, Post, Get} from '@shared/decorators/rest';
import {RequiredPipe} from '@shared/pipes/required.pipe';
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
		await this.authService.activateAccount(uuid, token);
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
	refreshTokens(@Req() req) {
		const username = req.user['username'];
		const refreshToken = req.user['refreshToken'];
		return this.authService.refreshTokens(username, refreshToken);
	}

	@Get({
		path: 'logout',
		description: "Déconnexion de l'utilisateur.",
		restriction: 'user',
	})
	logout(@Req() req) {
		return this.authService.logOut(req.user['sub']);
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
		return await this.authService.accountConfirmation(email);
	}
}
