import {IsEmail} from '@nestjs/class-validator';

export class PasswordForgotDto {
	@IsEmail()
	email: string;
}
