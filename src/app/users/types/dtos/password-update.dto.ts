import {Matches, IsEmail, IsNotEmpty, IsString} from '@nestjs/class-validator';

export class PasswordUpdateDto {
	@IsString()
	@IsNotEmpty()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/,
		{message: 'STRONG_PASSWORD_REQUIRED'}
	)
	password: string;
}
