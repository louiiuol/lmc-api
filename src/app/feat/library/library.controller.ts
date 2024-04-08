import {
	ForbiddenException,
	Header,
	Param,
	Query,
	Req,
	Res,
	StreamableFile,
} from '@nestjs/common';

import {join} from 'path';
import {Response} from 'express';
import {createReadStream, existsSync} from 'fs';
import {CurrentUser} from '@shared/decorators/current-user.decorator';
import {Controller, Get, PartialUpdate} from '@shared/decorators';
import {UsersService} from '@feat/users/users.service';
import {LibraryService} from './library.service';
import {CourseViewDto} from './types';

@Controller({path: 'courses', name: 'Librairie'})
export class LibraryController {
	constructor(
		private libraryService: LibraryService,
		private usersService: UsersService
	) {}

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
		@Req() request
	): Promise<StreamableFile> {
		if (
			p.index <= 3 ||
			(await this.usersService.findOneByEmail(request.user?.email)).subscribed
		) {
			const filePath = `library/${p.index}/${p.fileName}.pdf`;
			return new StreamableFile(
				createReadStream(join(process.cwd(), filePath))
			);
		} else throw new ForbiddenException('Contenu réservé aux abonnés');
	}

	@Get({
		path: ':index/files/:fileName/download',
		description: "Récupération d'un fichier d'une leçon, au format pdf.",
		restriction: 'user',
	})
	async downloadPdf(
		@Param() p: {index: number; fileName: string},
		@Res() res: Response
	): Promise<void> {
		const filePath = `library/${p.index}/${p.fileName}.pdf`;

		// Check if the file exists
		if (existsSync(filePath)) {
			// Set response headers for PDF download
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename=${p.fileName}.pdf`
			);

			// Create a read stream from the file path
			const fileStream = createReadStream(filePath);

			// Pipe the file stream to the response
			fileStream.pipe(res);
		} else {
			// If the file does not exist, send a 404 response
			res.status(404).send('File not found');
		}
	}

	@Get({
		path: ':index/download',
		description:
			"Téléchargement de l'ensemble des fichiers d'une leçon compressé dans un fichier zip.",
		restriction: 'user',
	})
	async downloadLesson(@Param() p: {index: number}, @Res() res: Response) {
		const lessonPath = `library/${p.index}/${p.index}.zip`;
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename=${p.index + 1}.zip`
		);

		// Pipe the zip file to the HTTP response
		const fileStream = createReadStream(lessonPath);
		fileStream.pipe(res);
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
		return await this.usersService.update(user.uuid, {currentLessonIndex});
	}
}
