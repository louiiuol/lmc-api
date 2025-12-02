import { UsersModule } from '@feat/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '@shared/modules/mail/mail.module';
import { environment } from 'src/app/environment';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { RefreshTokenStrategy } from './guards/jwt/jwt-refresh.strategy';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: environment.JWT_SECRET_KEY,
		}),
		MailModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		RefreshTokenStrategy,
		AdminGuard,
	],
})
export class AuthModule {}
