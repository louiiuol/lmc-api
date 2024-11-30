import {Module, forwardRef} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MailModule} from '@shared/modules/mail/mail.module';
import {User} from './types/user.entity';
import {UserProfile} from './user.profile';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {IsUserAlreadyExistConstraint} from './validators/unique-email.validator';

@Module({
	imports: [
		forwardRef(() => TypeOrmModule.forFeature([User])),
		JwtModule,
		MailModule,
	],
	providers: [UsersService, UserProfile, IsUserAlreadyExistConstraint],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
