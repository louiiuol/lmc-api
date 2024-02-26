import {Module} from '@nestjs/common';
import {UsersModule} from '../users/users.module';
import {LibraryModule} from '../library/library.module';
import {AdminController} from './admin.controller';
import {AdminUsersService} from './admin-users.service';

@Module({
	imports: [UsersModule, LibraryModule],
	controllers: [AdminController],
	providers: [AdminUsersService],
})
export class AdminModule {}
