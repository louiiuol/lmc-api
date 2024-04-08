import {Matches, IsEmail, IsNotEmpty, IsString} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean} from 'class-validator';
const passwordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;

export class UserCreateDto {
	@ApiProperty({
		description: "Identifiant de l'utilisateur. Doit être unique.",
		example: 'example@mail.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "Mot de passe de l'utilisateur. Doit être sécurisé. ",
		example: 'mot-de-passe',
		pattern: String(passwordPattern),
	})
	@IsString()
	@IsNotEmpty()
	@Matches(passwordPattern, {message: 'Mot de passe sécurisé requis.'})
	password: string;

	@ApiProperty({
		description: "Définit si l'user est inscrit à la newsletter.",
	})
	@IsBoolean()
	newsletter: boolean;
}
