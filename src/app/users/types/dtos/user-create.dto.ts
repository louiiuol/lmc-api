import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString} from 'class-validator';
import {IsUserAlreadyExist} from 'src/app/users/validators/unique-email.validator';

export class UserCreateDto {
	@IsEmail()
	@IsUserAlreadyExist()
	@ApiProperty({
		description: 'Identifier of the user to create',
		uniqueItems: true,
		example: 'example@mail.com',
		pattern: /^\S+@\S+\.\S+$/.toString(),
	})
	email!: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description:
			'password of the user. Ensure string has: two uppercase letters - one special case letter - 2 digits - three lowercase letters ',
		pattern:
			/^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/.toString(),
	})
	password!: string;
}
