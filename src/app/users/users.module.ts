import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {User} from './types/user.entity';
import {UserProfile} from './user.profile';
import {IsUserAlreadyExistConstraint} from './validators/unique-email.validator';
import {JwtModule} from '@nestjs/jwt';

@Module({
	imports: [forwardRef(() => TypeOrmModule.forFeature([User])), JwtModule],
	providers: [UsersService, UserProfile, IsUserAlreadyExistConstraint],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
