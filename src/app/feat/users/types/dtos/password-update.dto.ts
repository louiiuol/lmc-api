import {Matches, IsEmail, IsNotEmpty, IsString} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class PasswordUpdateDto {
	@ApiProperty({description: 'Nouveau mot de passe'})
	@IsString()
	@IsNotEmpty()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/,
		{message: 'STRONG_PASSWORD_REQUIRED'}
	)
	password: string;
}
