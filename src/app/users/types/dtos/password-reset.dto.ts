import {IsJWT, IsNotEmpty, IsString, Matches} from '@nestjs/class-validator';

export class PasswordResetDto {
	@IsJWT()
	token: string;

	@IsString()
	@IsNotEmpty()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/,
		{message: 'STRONG_PASSWORD_REQUIRED'}
	)
	password: string;
}
