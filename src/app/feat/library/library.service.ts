import {Injectable, StreamableFile} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Course} from './types';

import {UsersService} from '@feat/users/users.service';

import {createReadStream, existsSync, unlinkSync} from 'fs';

import {Response} from 'express';
import {join} from 'path';
import {ZipService} from './zip.service';

@Injectable()
export class LibraryService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>,
		private readonly usersService: UsersService,
		private readonly zipService: ZipService
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

	async downloadCourse(index: number, res: Response<any, Record<string, any>>) {
		const folder = (await this.courseRepository.findOneBy({order: index - 1}))
			.uuid;
		const lessonPath = `uploads/courses/${folder}`;
		const outputZip = `uploads/courses/${folder}/${index}.zip`;

		await this.zipService.zipDirectory(lessonPath, outputZip);

		res.download(outputZip, err => {
			if (err) {
				res.status(500).send('Could not download the file');
			}
			unlinkSync(outputZip);
		});
	}
}
