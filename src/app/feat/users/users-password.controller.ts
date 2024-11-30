import {Body, Param} from '@nestjs/common';

import {Controller, PartialUpdate, Post, Update} from '@shared/decorators';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {PasswordForgotDto, PasswordResetDto, PasswordUpdateDto} from './types';
import {UsersPasswordService} from './users-password-service';

@Controller({name: 'Mot de passe'})
export class UsersPasswordController {
	constructor(private readonly passwordService: UsersPasswordService) {}

	@Post({
		path: 'forgot-password',
		description: "Demande d'envoi d'un email pour réinitialiser le mot passe.",
		code: 200,
		body: PasswordForgotDto,
	})
	sendResetpasswordEmail(@Body() dto: PasswordForgotDto) {
		return this.passwordService.sendResetpasswordEmail(dto.email);
	}

	@PartialUpdate({
		path: 'update-password',
		description: "Mise à jour du mot de passe de l'utilisateur connecté",
		code: 200,
		body: PasswordUpdateDto,
		restriction: 'user',
	})
	updatePassword(@CurrentUser() user, @Body() dto: PasswordUpdateDto) {
		return this.passwordService.updatePasswordFromLoggedUser(
			user.uuid,
			dto.password
		);
	}

	@Update({
		path: 'users/:uuid/reset-password',
		description:
			"Réinitialisation du mot de passe. (Token d'identification dans le body.)",
		code: 200,
		body: PasswordResetDto,
	})
	resetPasswordFromToken(
		@Body() dto: PasswordResetDto,
		@Param('uuid') uuid: string
	) {
		return this.passwordService.updatePasswordFromToken(uuid, dto);
	}
}
