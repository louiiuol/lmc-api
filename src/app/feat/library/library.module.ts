import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {UsersModule} from '@feat/users/users.module';
import {LibraryService} from './library.service';
import {LibraryController} from './library.controller';
import {Course, Phoneme} from './types';
import {ZipService} from './zip.service';

@Module({
	imports: [TypeOrmModule.forFeature([Course, Phoneme]), UsersModule],
	providers: [LibraryService, ZipService],
	controllers: [LibraryController],
	exports: [LibraryService],
})
export class LibraryModule {}
