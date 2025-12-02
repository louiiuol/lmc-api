import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordCheckDto {
	@ApiProperty({ description: 'Mot de passe à comparer.' })
	@IsString()
	@IsNotEmpty()
	password: string;
}
