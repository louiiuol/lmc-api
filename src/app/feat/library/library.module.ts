import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {UsersModule} from '@feat/users/users.module';
import {LibraryService} from './library.service';
import {LibraryController} from './library.controller';
import {Course, Phoneme} from './types';

@Module({
	imports: [TypeOrmModule.forFeature([Course, Phoneme]), UsersModule],
	providers: [LibraryService],
	controllers: [LibraryController],
	exports: [LibraryService],
})
export class LibraryModule {}
