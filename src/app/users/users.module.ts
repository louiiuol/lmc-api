import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {User} from './types/user.entity';
import {UserProfile} from './user.profile';
import {IsUserAlreadyExistConstraint} from './validators/unique-email.validator';

@Module({
	imports: [forwardRef(() => TypeOrmModule.forFeature([User]))],
	providers: [UsersService, UserProfile, IsUserAlreadyExistConstraint],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
