import {UsersModule} from '@feat/users/users.module';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {MailModule} from '@shared/modules/mail/mail.module';
import {environment} from 'src/app/environment';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {LocalStrategy} from './strategies/local.strategy';
import {SupabaseStrategy} from './strategies/supabase.strategy';

const AuthStrategies = [LocalStrategy, SupabaseStrategy];

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
	providers: [AuthService, ...AuthStrategies],
})
export class AuthModule {}
