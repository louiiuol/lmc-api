import {IsJWT, IsNotEmpty, IsString, Matches} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';

const passwordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;

export class PasswordResetDto {
	@ApiProperty({
		description:
			"Token d'identification généré par l'api (/api/forgot-password).",
	})
	@IsJWT()
	token: string;

	@ApiProperty({
		description: 'Nouveau mot de passe.',
		example: '&123Mdp',
		pattern: String(passwordPattern),
	})
	@IsString()
	@IsNotEmpty()
	@Matches(passwordPattern, {message: 'STRONG_PASSWORD_REQUIRED'})
	password: string;
}
