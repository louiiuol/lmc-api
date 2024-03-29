import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from '@nestjs/class-validator';
//import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean} from 'class-validator';

export class UserUpdateDto {
	/* @ApiProperty({
		description: 'Contact',
		uniqueItems: true,
		example: 'example@mail.com',
	}) */
	@IsOptional()
	@IsEmail()
	email?: string;

	/* @ApiProperty({
		description: 'Prénom',
		example: 'John',
	}) */
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(20)
	firstName?: string;

	/* @ApiProperty({
		description: 'Nom',
		example: 'Doe',
	}) */
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(60)
	lastName?: string;

	/* @ApiProperty({
		description: "Définit si l'utilisateur est abonné à la newsletter.",
	}) */
	@IsOptional()
	@IsBoolean()
	newsletter: boolean;
}
