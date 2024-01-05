import {
	Matches,
	IsEmail,
	IsNotEmpty,
	IsString,
	IsOptional,
} from '@nestjs/class-validator';
import {IsBoolean} from 'class-validator';

export class UserCreateDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/,
		{message: 'STRONG_PASSWORD_REQUIRED'}
	)
	password: string;

	@IsBoolean()
	newsletter: boolean;
}
