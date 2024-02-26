import {IsOptional, IsBoolean} from '@nestjs/class-validator';

export class UserUpdateAdminDto {
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsBoolean()
	subscribed?: boolean;

	@IsOptional()
	refreshToken?: string | null;
}
