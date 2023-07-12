import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
} from '@nestjs/class-validator';

export class UserUpdateDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	firstName: string;

	@IsString()
	lastName?: string;
}
