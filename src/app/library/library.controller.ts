import {Controller, Get, Post} from '@nestjs/common';
import {LibraryService} from './library.service';

@Controller()
export class LibraryController {
	constructor(private libraryService: LibraryService) {}

	@Post('generate-courses')
	async generateLibrary() {
		return await this.libraryService.createLibrary();
	}

	@Get('courses')
	async getAllCourses() {
		return await this.libraryService.getAllCourses();
	}
}
