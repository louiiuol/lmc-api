import {Module} from '@nestjs/common';
import {UsersModule} from '@feat/users/users.module';
import {LibraryModule} from '@feat/library/library.module';
import {AdminUsersController} from './users/admin-users.controller';
import {AdminUsersService} from './users/admin-users.service';
import {MailModule} from '@shared/modules/mail/mail.module';
import {User} from '@feat/users/types';
import {TypeOrmModule} from '@nestjs/typeorm';
import {LibraryAdminService} from './library/admin-library.service';
import {Course, Phoneme} from '@feat/library/types';
import {AdminLibraryController} from './library/admin-library.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Course, Phoneme]),
		UsersModule,
		LibraryModule,
		MailModule,
	],
	controllers: [AdminUsersController, AdminLibraryController],
	providers: [AdminUsersService, LibraryAdminService],
})
export class AdminModule {}
