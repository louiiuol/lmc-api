import {Body, Param} from '@nestjs/common';

import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {
	PasswordForgotDto,
	PasswordResetDto,
	PasswordCheckDto,
	PasswordUpdateDto,
} from './types';
import {UsersPasswordService} from './users-password-service';
import {Controller, Get, PartialUpdate, Post, Update} from '@shared/decorators';

@Controller({name: 'Mot de passe'})
export class UsersPasswordController {
	constructor(private readonly passwordService: UsersPasswordService) {}

	@Update({
		path: 'users/:uuid/reset-password',
		description:
			"Réinitialisation du mot de passe. (Token d'identification dans le body.)",
		code: 200,
		body: PasswordResetDto,
	})
	resetPassword(@Body() dto: PasswordResetDto, @Param('uuid') uuid: string) {
		return this.passwordService.resetPassword(uuid, dto);
	}

	@Post({
		path: 'forgot-password',
		description: "Demande d'envoi d'un email pour réinitialiser le mot passe.",
		code: 200,
		body: PasswordForgotDto,
	})
	forgotPassword(@Body() dto: PasswordForgotDto) {
		return this.passwordService.forgotPassword(dto.email);
	}

	@Get({
		path: 'check-password',
		description: "Vérification du mot de passe de l'utilisateur connecté.",
		restriction: 'user',
		body: PasswordCheckDto,
	})
	checkPassword(@Body() dto: PasswordCheckDto, @CurrentUser() user) {
		return this.passwordService.checkPassword(user, dto.password);
	}

	@PartialUpdate({
		path: 'update-password',
		description: "Mise à jour du mot de passe de l'utilisateur connecté",
		code: 200,
		body: PasswordUpdateDto,
		restriction: 'user',
	})
	updatePassword(@CurrentUser() user, @Body() dto: PasswordUpdateDto) {
		return this.passwordService.updatePassword(user.uuid, dto.password);
	}
}
