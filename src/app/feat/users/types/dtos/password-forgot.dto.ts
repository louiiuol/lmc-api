import {IsEmail} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class PasswordForgotDto {
	@ApiProperty({
		description: "Destinataire de l'email pour réinitialiser son mote passe",
	})
	@IsEmail()
	email: string;
}
