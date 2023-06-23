import {IsEmail, IsNotEmpty, IsString} from 'class-validator';
import {IsUserAlreadyExist} from 'src/app/users/validators/unique-email.validator';

export class UserCreateDto {
	@IsEmail()
	@IsUserAlreadyExist()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
