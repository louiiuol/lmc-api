import {IsNotEmpty, IsString} from '@nestjs/class-validator';

export class PasswordCheckDto {
	@IsString()
	@IsNotEmpty()
	password: string;
}
