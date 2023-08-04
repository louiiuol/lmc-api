import {Controller, Get, Post, UseGuards} from '@nestjs/common';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';

import {LibraryService} from './library.service';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {AdminGuard} from '../auth/guards/roles/admin.guard';
import {CourseViewDto} from './types/courses/dtos/course-view.dto';
import {Course} from './types';

@Controller()
export class LibraryController {
	constructor(
		@InjectMapper() private readonly classMapper: Mapper,
		private libraryService: LibraryService
	) {}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Post('courses')
	async generateLibrary() {
		await this.libraryService.createLibrary();
		return {
			code: 201,
			data: null,
			message: '🎉 Library successfully generated!',
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses')
	async getAllCourses() {
		return await this.libraryService.getAllCourses();
	}
}
