import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {UsersModule} from '@feat/users/users.module';
import {LocalStrategy} from './guards/local/local.strategy';
import {JwtStrategy} from './guards/jwt/jwt.strategy';
import {AuthController} from './auth.controller';
import {environment} from 'src/app/environment';
import {AdminGuard} from './guards/admin.guard';
import {RefreshTokenStrategy} from './guards/jwt/jwt-refresh.strategy';
import {MailModule} from '@shared/modules/mail/mail.module';

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
