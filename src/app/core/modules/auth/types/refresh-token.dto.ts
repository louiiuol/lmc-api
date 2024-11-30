import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class TokenRefreshDto {
	@ApiProperty({example: 'refreshToken', description: 'Refresh token'})
	@IsString()
	@IsNotEmpty()
	refreshToken: string;
}
