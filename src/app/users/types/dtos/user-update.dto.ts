import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from '@nestjs/class-validator';

export class UserUpdateDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(20)
	firstName?: string;

	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(60)
	lastName?: string;
}
