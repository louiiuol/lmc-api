import {
	Body,
	Logger,
	Param,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';

import {
	Controller,
	Delete,
	Get,
	PartialUpdate,
	Post,
} from '@shared/decorators/rest';
import {CourseCreateDto, CourseViewDto} from '@feat/library/types';
import {LibraryAdminService} from './admin-library.service';
import {PdfUploader} from '@feat/library/pdf-upload';
import {CourseCreateFilesDto} from '@feat/library/types/courses/dtos/course-create.dto';
import {
	CourseEditDto,
	CourseEditFilesDto,
} from '@feat/library/types/courses/dtos/course-edit.dto';
import {PhonemeCreateDto} from '@feat/library/types/phonemes/dtos/phoneme-create.dto';
import {FileFieldsInterceptor} from '@nestjs/platform-express';
import {SoundAddDto} from '@feat/library/types/courses/dtos/sound-add-dto';

const COURSE_FILES_UPLOAD = PdfUploader([
	{name: 'lesson', maxCount: 1},
	{name: 'script', maxCount: 1},
	{name: 'poster', maxCount: 1},
	{name: 'exercice', maxCount: 1},
]);

@Controller({path: 'admin', name: 'Back Office (Gestion de la bibliothèque)'})
export class AdminLibraryController {
	constructor(private readonly libraryService: LibraryAdminService) {}

	// @Post('courses')
	// async generateLibrary() {
	// 	await this.libraryService.createLibrary();
	// 	return {
	// 		code: 201,
	// 		data: null,
	// 		message: '🎉 Library successfully generated!',
	// 	};
	// }

	@Get({path: 'refresh-library'})
	async generateLibrary() {
		await this.libraryService.createLibrary();
	}

	@Post({
		path: 'courses',
		description: "Création d'une nouvelle leçon.",
		body: CourseCreateDto,
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	@UseInterceptors(COURSE_FILES_UPLOAD)
	async createCourse(
		@Body() dto: CourseCreateDto,
		@UploadedFiles() files: CourseCreateFilesDto
	) {
		return await this.libraryService.createCourse(dto, files);
	}

	@PartialUpdate({
		path: 'courses/:uuid',
		description: "Edition d'une leçon",
		restriction: 'admin',
	})
	@UseInterceptors(COURSE_FILES_UPLOAD)
	async editCourse(
		@Body() dto: CourseEditDto,
		@Param('uuid') uuid: string,
		@UploadedFiles() files: CourseEditFilesDto
	) {
		Logger.log(uuid);
		return await this.libraryService.editCourse(uuid, dto, files);
	}

	@Delete({
		path: 'courses/:uuid/files/:filename',
		description: "Suppression d'un fichier d'une leçon",
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	async removeCourseFile(
		@Param('uuid') uuid: string,
		@Param('filename') filename: string
	) {
		return await this.libraryService.removeCourseFile(uuid, filename);
	}

	@Delete({
		path: 'courses/:uuid',
		description: "Suppression d'une leçon",
		restriction: 'admin',
	})
	async deleteCourse(@Param('uuid') uuid: string) {
		await this.libraryService.deleteCourse(uuid);
	}

	@Post({
		path: 'courses/:uuid/phonemes',
		description: "Ajout d'un phonème à une leçon",
		body: PhonemeCreateDto,
		restriction: 'admin',
	})
	@UseInterceptors(FileFieldsInterceptor([{name: 'poster', maxCount: 1}]))
	async addPhoneme(
		@Param('uuid') uuid: string,
		@Body() dto: PhonemeCreateDto,
		@UploadedFiles() files: {poster?: Express.Multer.File[]}
	) {
		dto.poster = files.poster;
		return this.libraryService.addPhoneme(uuid, dto);
	}

	@Delete({
		path: 'courses/:uuid/phonemes/:name',
		description: "Suppression d'un phonème d'une leçon",
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	async deletePhoneme(
		@Param('uuid') uuid: string,
		@Param('name') name: string
	) {
		return await this.libraryService.removePhoneme(uuid, name);
	}

	@Post({
		path: 'courses/:uuid/sounds',
		description: "Ajout d'un son à la leçon ",
		body: SoundAddDto,
		restriction: 'admin',
	})
	@UseInterceptors(FileFieldsInterceptor([{name: 'file', maxCount: 1}]))
	async addSound(
		@Param('uuid') uuid: string,
		@Body() dto: SoundAddDto,
		@UploadedFiles() files: {file?: Express.Multer.File[]}
	) {
		dto.file = files.file;
		return await this.libraryService.addSound(uuid, dto);
	}

	@Delete({
		path: 'courses/:uuid/sounds/:sound',
		description: "Suppression d'un son d'une leçon",
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	async deleteSound(
		@Param('uuid') uuid: string,
		@Param('sound') sound: string
	) {
		return await this.libraryService.removeSound(uuid, sound);
	}
}
