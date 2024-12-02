import {Body, Param, UploadedFiles, UseInterceptors} from '@nestjs/common';

import {
	Controller,
	Delete,
	Get,
	PartialUpdate,
	Post,
	Update,
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
import {PosterAddDto} from '@feat/library/types/courses/dtos/poster-create-dto';
import {ReorderItemsDto} from '@feat/library/types/reorder-items.dto';

const COURSE_FILES_UPLOAD = PdfUploader([
	{name: 'lesson', maxCount: 1},
	{name: 'script', maxCount: 1},
	{name: 'poster', maxCount: 1},
	{name: 'exercices', maxCount: 1},
]);

const PHONEME_FILES_UPLOAD = FileFieldsInterceptor([
	{name: 'poster', maxCount: 1},
]);
const SOUND_FILES_UPLOAD = FileFieldsInterceptor([{name: 'file', maxCount: 1}]);

@Controller({path: 'admin', name: 'Back Office (Gestion de la bibliothèque)'})
export class AdminLibraryController {
	constructor(private readonly libraryService: LibraryAdminService) {}

	@Get({
		path: 'refresh-library',
		description:
			"Création de la bibliothèque à partir du dossier 'library' à la racine du repository",
		restriction: 'admin',
	})
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
	@UseInterceptors(PHONEME_FILES_UPLOAD)
	async addPhoneme(
		@Param('uuid') uuid: string,
		@Body() dto: PhonemeCreateDto,
		@UploadedFiles() files: {poster?: Express.Multer.File[]}
	) {
		dto.poster = files?.poster;
		return this.libraryService.addPhoneme(uuid, dto);
	}

	@PartialUpdate({
		path: 'courses/:courseUuid/phonemes/:uuid',
		description: "Edition d'un phonème",
		restriction: 'admin',
	})
	@UseInterceptors(COURSE_FILES_UPLOAD)
	async editPhoneme(
		@Body() dto: PhonemeCreateDto,
		@Param('courseUuid') courseUuid: string,
		@Param('uuid') uuid: string,
		@UploadedFiles() files?: {poster?: Express.Multer.File[]}
	) {
		dto.poster = files?.poster;
		return await this.libraryService.editPhoneme(courseUuid, uuid, dto);
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

	@Delete({
		path: 'courses/:uuid/phonemes/:name/poster',
		description: "Suppression du poster d'un phonème",
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	async deletePhonemePoster(
		@Param('uuid') uuid: string,
		@Param('name') name: string
	) {
		return await this.libraryService.removePhonemePoster(uuid, name);
	}

	@Post({
		path: 'courses/:uuid/sounds',
		description: "Ajout d'un son à la leçon ",
		body: PosterAddDto,
		restriction: 'admin',
	})
	@UseInterceptors(SOUND_FILES_UPLOAD)
	async addSound(
		@Param('uuid') uuid: string,
		@Body() dto: PosterAddDto,
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

	@Post({
		path: 'courses/:uuid/posters',
		description: "Ajout d'une affiche à la leçon ",
		body: PosterAddDto,
		restriction: 'admin',
	})
	@UseInterceptors(SOUND_FILES_UPLOAD)
	async addPoster(
		@Param('uuid') uuid: string,
		@Body() dto: PosterAddDto,
		@UploadedFiles() files: {file?: Express.Multer.File[]}
	) {
		dto.file = files.file;
		return await this.libraryService.addPoster(uuid, dto);
	}

	@Delete({
		path: 'courses/:uuid/posters/:poster',
		description: "Suppression d'un son d'une leçon",
		returnType: CourseViewDto,
		restriction: 'admin',
	})
	async deletePoster(
		@Param('uuid') uuid: string,
		@Param('poster') poster: string
	) {
		return await this.libraryService.removePoster(uuid, poster);
	}

	@Update({
		path: 'courses/reorder',
		description: "Réorganisation des semaines dans l'ordre donné.",
		body: ReorderItemsDto,
	})
	async reorderItems(@Body() reorderItemsDto: ReorderItemsDto) {
		return await this.libraryService.reorderItems(reorderItemsDto.newOrder);
	}
}
