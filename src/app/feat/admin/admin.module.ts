import {Module, forwardRef} from '@nestjs/common';
import {UsersModule} from '@feat/users/users.module';
import {LibraryModule} from '@feat/library/library.module';
import {AdminController} from './admin.controller';
import {AdminUsersService} from './admin-users.service';
import {MailModule} from '@shared/modules/mail/mail.module';
import {User} from '@feat/users/types';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
	imports: [
		forwardRef(() => TypeOrmModule.forFeature([User])),
		UsersModule,
		LibraryModule,
		MailModule,
	],
	controllers: [AdminController],
	providers: [AdminUsersService],
})
export class AdminModule {}
