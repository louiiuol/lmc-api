import {
	Controller,
	Get,
	UseGuards,
	Body,
	Post,
	Param,
	HttpCode,
	Patch,
	Put,
} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {
	PasswordForgotDto,
	PasswordResetDto,
	PasswordCheckDto,
	PasswordUpdateDto,
} from './types';
import {UsersPasswordService} from './users-password-service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Mot de passe')
@Controller()
export class UsersPasswordController {
	constructor(private readonly passwordService: UsersPasswordService) {}

	@Put('users/:uuid/reset-password')
	@HttpCode(200)
	resetPassword(@Body() dto: PasswordResetDto, @Param('uuid') uuid: string) {
		return this.passwordService.resetPassword(uuid, dto);
	}

	@Post('forgot-password')
	@HttpCode(200)
	forgotPassword(@Body() dto: PasswordForgotDto) {
		return this.passwordService.forgotPassword(dto.email);
	}

	@UseGuards(JwtAuthGuard)
	@Get('check-password')
	checkPassword(@Body() dto: PasswordCheckDto, @CurrentUser() user) {
		return this.passwordService.checkPassword(user, dto.password);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('update-password')
	@HttpCode(200)
	updatePassword(@CurrentUser() user, @Body() dto: PasswordUpdateDto) {
		return this.passwordService.updatePassword(user.uuid, dto.password);
	}
}
