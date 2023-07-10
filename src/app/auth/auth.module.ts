import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './guards/local/local.strategy';
import {JwtStrategy} from './guards/jwt/jwt.strategy';
import {JwtModule} from '@nestjs/jwt';
import {AuthController} from './auth.controller';
import {environment} from '../environment';
import {AdminGuard} from './guards/roles/admin.guard';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: environment.JWT_SECRET_KEY,
			signOptions: {expiresIn: '1d'},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy, AdminGuard],
})
export class AuthModule {}
