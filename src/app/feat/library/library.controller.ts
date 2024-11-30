import {Header, Param, Query, Res, StreamableFile} from '@nestjs/common';

import {Controller, Get, PartialUpdate} from '@shared/decorators';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Response} from 'express';
import {LibraryService} from './library.service';
import {CourseViewDto} from './types';

@Controller({path: 'courses', name: 'Librairie'})
export class LibraryController {
	constructor(private readonly libraryService: LibraryService) {}

	@Get({
		description: "Récupération de l'ensemble des leçons de l'année scolaire.",
		returnType: CourseViewDto,
		array: true,
	})
	async getAllCourses() {
		return await this.libraryService.getAllCourses();
	}

	@Get({
		path: ':index/files/:fileName',
		description: "Récupération d'un fichier d'une leçon, sous forme de stream.",
		restriction: 'user',
	})
	@Header('Content-type', 'application/pdf')
	async getFile(
		@Param() p: {index: number; fileName: string},
		@CurrentUser() user
	): Promise<StreamableFile> {
		return await this.libraryService.getStreamableFile(user?.email, p);
	}

	@Get({
		path: ':index/files/:fileName/download',
		description: "Récupération d'un fichier d'une leçon, au format pdf.",
		restriction: 'user',
	})
	downloadPdf(
		@Param() p: {index: number; fileName: string},
		@Res() res: Response,
		@CurrentUser() user
	) {
		this.libraryService.downloadPdf(user.email, p, res);
	}

	@Get({
		path: ':index/download',
		description:
			"Téléchargement de l'ensemble des fichiers d'une leçon compressé dans un fichier zip.",
		restriction: 'user',
	})
	async downloadLesson(@Param() p: {index: number}, @Res() res: Response) {
		this.libraryService.downloadCourse(p.index, res);
	}

	@PartialUpdate({
		path: 'currentLesson',
		description:
			"Mis à jour de l'index de progression de l'utilisateur connecté.",
		restriction: 'user',
	})
	async setCurrentLesson(
		@CurrentUser() user,
		@Query('index') currentLessonIndex: number
	) {
		return await this.libraryService.updateProgression(
			user.uuid,
			currentLessonIndex
		);
	}
}
