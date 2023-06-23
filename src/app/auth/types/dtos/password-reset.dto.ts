import {IsJWT, IsNotEmpty, IsString, IsUUID} from '@nestjs/class-validator';

export class PasswordResetDto {
	@IsUUID()
	uuid: string;

	@IsJWT()
	token: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
