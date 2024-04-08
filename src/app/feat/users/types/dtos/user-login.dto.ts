import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class UserLoginDto {
	@ApiProperty({description: "Identifiant de l'utilisateur"})
	@IsEmail()
	email!: string;

	@ApiProperty({description: "Mot de passe de l'utilisateur"})
	@IsString()
	@IsNotEmpty()
	password!: string;
}
