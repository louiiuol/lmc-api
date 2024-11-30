import {LibraryModule} from '@feat/library/library.module';
import {Course, Phoneme} from '@feat/library/types';
import {User} from '@feat/users/types';
import {UsersModule} from '@feat/users/users.module';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MailModule} from '@shared/modules/mail/mail.module';
import {AdminLibraryController} from './library/admin-library.controller';
import {LibraryAdminService} from './library/admin-library.service';
import {AdminUsersController} from './users/admin-users.controller';
import {AdminUsersService} from './users/admin-users.service';

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
