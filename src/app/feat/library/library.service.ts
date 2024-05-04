import {ForbiddenException, Injectable, StreamableFile} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Course} from './types';

import {UsersService} from '@feat/users/users.service';

import {createReadStream, existsSync} from 'fs';
import {join} from 'path';
import {Response} from 'express';

@Injectable()
export class LibraryService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>,
		private readonly usersService: UsersService
	) {}

	getAllCourses = async () =>
		(await this.courseRepository.find({loadEagerRelations: true})).sort(
			(a, b) => a.order - b.order
		);

	updateProgression = async (uuid: any, currentLessonIndex: number) =>
		await this.usersService.update(uuid, {currentLessonIndex});

	async getStreamableFile(email: any, p: {index: number; fileName: string}) {
		const folder = (await this.courseRepository.findOneBy({order: p.index - 1}))
			.uuid;
		await this.checkSubscription(email, p.index);
		const filePath = `uploads/courses/${folder}/${p.fileName}.pdf`;
		return new StreamableFile(createReadStream(join(process.cwd(), filePath)));
	}

	async downloadPdf(
		email: string,
		p: {index: number; fileName: string},
		res: Response<any, Record<string, any>>
	) {
		const folder = (await this.courseRepository.findOneBy({order: p.index - 1}))
			.uuid;
		await this.checkSubscription(email, p.index);
		const filePath = `uploads/courses/${folder}/${p.fileName}.pdf`;

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

	async downloadCourse(
		email: any,
		p: {index: number},
		res: Response<any, Record<string, any>>
	) {
		const folder = (await this.courseRepository.findOneBy({order: p.index - 1}))
			.uuid;
		await this.checkSubscription(email, p.index);
		const lessonPath = `uploads/courses/${folder}/${p.index}.zip`;
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename=${p.index - 1}.zip`
		);

		// Pipe the zip file to the HTTP response
		const fileStream = createReadStream(lessonPath);
		fileStream.pipe(res);
	}

	private checkSubscription = async (email: string, index: number) => {
		if (
			!(
				index <= 3 || (await this.usersService.findOneByEmail(email)).subscribed
			)
		)
			throw new ForbiddenException('Ce contenu est réservé aux abonnés.');
	};
}
