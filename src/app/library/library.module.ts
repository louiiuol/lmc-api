import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {LibraryService} from './library.service';
import {LibraryController} from './library.controller';
import {Course, Phoneme} from './types';
import {UsersModule} from '../users/users.module';

@Module({
	imports: [TypeOrmModule.forFeature([Course, Phoneme]), UsersModule],
	providers: [LibraryService],
	controllers: [LibraryController],
	exports: [LibraryService],
})
export class LibraryModule {}
