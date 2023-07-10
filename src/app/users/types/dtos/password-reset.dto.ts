import {IsJWT, IsNotEmpty, IsString} from '@nestjs/class-validator';

export class PasswordResetDto {
	@IsJWT()
	token: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
