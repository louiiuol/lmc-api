import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {User} from './types/user.entity';
import {UserProfile} from './user.profile';
import {IsUserAlreadyExistConstraint} from './validators/unique-email.validator';
import {JwtModule} from '@nestjs/jwt';
import {UsersPasswordService} from './users-password-service';
import {UsersPasswordController} from './users-password.controller';

@Module({
	imports: [forwardRef(() => TypeOrmModule.forFeature([User])), JwtModule],
	providers: [
		UsersService,
		UserProfile,
		IsUserAlreadyExistConstraint,
		UsersPasswordService,
	],
	controllers: [UsersController, UsersPasswordController],
	exports: [UsersService],
})
export class UsersModule {}
