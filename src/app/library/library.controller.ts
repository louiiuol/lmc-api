import {
	Controller,
	Get,
	Header,
	Param,
	Patch,
	Query,
	Req,
	Res,
	StreamableFile,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';

import {LibraryService} from './library.service';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {createReadStream} from 'fs';
import {join} from 'path';
import {UsersService} from '../users/users.service';

import {Response} from 'express';
import * as fs from 'fs';
import {CurrentUser} from '../auth/decorators/current-user.decorator';

@Controller('courses')
export class LibraryController {
	constructor(
		private libraryService: LibraryService,
		private usersService: UsersService
	) {}

	@Get()
	async getAllCourses() {
		return await this.libraryService.getAllCourses();
	}

	@UseGuards(JwtAuthGuard)
	@Get(':index/files/:fileName')
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
		} else throw new UnauthorizedException('FOR_SUB_ONLY');
	}

	@UseGuards(JwtAuthGuard)
	@Get(':index/files/:fileName/download')
	async downloadPdf(
		@Param() p: {index: number; fileName: string},
		@Res() res: Response
	): Promise<void> {
		const filePath = `library/${p.index}/${p.fileName}.pdf`;

		// Check if the file exists
		if (fs.existsSync(filePath)) {
			// Set response headers for PDF download
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename=${p.fileName}.pdf`
			);

			// Create a read stream from the file path
			const fileStream = fs.createReadStream(filePath);

			// Pipe the file stream to the response
			fileStream.pipe(res);
		} else {
			// If the file does not exist, send a 404 response
			res.status(404).send('File not found');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get(':index/download')
	async downloadLesson(@Param() p: {index: number}, @Res() res: Response) {
		const lessonPath = `library/${p.index}/${p.index}.zip`;
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename=${p.index + 1}.zip`
		);

		// Pipe the zip file to the HTTP response
		const fileStream = fs.createReadStream(lessonPath);
		fileStream.pipe(res);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('currentLesson')
	async setCurrentLesson(@CurrentUser() user, @Query('index') index: number) {
		const entity = await this.usersService.findOneByUuid(user.uuid);
		entity.currentLessonIndex = index;
		return (await this.usersService.save(entity)).currentLessonIndex;
	}
}
