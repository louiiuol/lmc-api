import {COURSES} from '@feat/library/courses.constant';
import {LibraryService} from '@feat/library/library.service';
import {
	Course,
	CourseCreateDto,
	CourseGenerator,
	Phoneme,
} from '@feat/library/types';
import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';

import {CourseCreateFilesDto} from '@feat/library/types/courses/dtos/course-create.dto';
import * as fs from 'fs';
import {Repository} from 'typeorm';
import {v4 as uuidv4} from 'uuid';

import {CourseEditDto} from '@feat/library/types/courses/dtos/course-edit.dto';
import {PosterAddDto} from '@feat/library/types/courses/dtos/poster-create-dto';
import {PhonemeCreateDto} from '@feat/library/types/phonemes/dtos/phoneme-create.dto';
import {StorageService} from './storage.service';

@Injectable()
export class LibraryAdminService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>,
		@InjectRepository(Phoneme) private phonemeRepository: Repository<Phoneme>,
		private readonly publicLibraryService: LibraryService,
		private readonly storageService: StorageService
	) {}

	createLibrary = async () => {
		const phoneme = await this.phonemeRepository.find();
		const courses = await this.publicLibraryService.getAllCourses();

		try {
			await Promise.all([
				phoneme.map(async p => {
					await this.phonemeRepository.delete({uuid: p.uuid});
				}),
				courses.map(async c => {
					await this.courseRepository.delete({uuid: c.uuid});
				}),
			]);
		} catch (e) {
			Logger.error('Failed to delete previous library (SQL error occurred)');
		}

		return COURSES.map(async (current, i) => {
			const entity = await this.courseRepository.save({...current, order: i});
			fs.cpSync(
				'uploads/src/' + (entity.order + 1),
				'uploads/courses/' + entity.uuid,
				{recursive: true}
			);
			return entity;
		});
	};

	async createCourse(dto: CourseCreateDto, files: CourseCreateFilesDto) {
		dto.uuid = uuidv4();
		dto.order = await this.courseRepository.count();
		fs.mkdir(`uploads/courses/${dto.uuid}`, () => {});
		return await this.courseRepository.save(this.castAsCourse(dto, files));
	}

	async editCourse(
		uuid: string,
		dto: CourseEditDto,
		files: CourseCreateFilesDto
	) {
		const entity = await this.courseRepository.findOneBy({uuid});
		dto.uuid = uuid;
		dto.order = entity.order;
		return this.courseRepository.save({
			...entity,
			...this.castAsCourse(dto, files),
		});
	}

	async removeCourseFile(uuid: string, filename: string) {
		const entity = await this.courseRepository.findOneBy({uuid});
		entity[filename] = false;
		this.removeFile(uuid, filename);
		return await this.courseRepository.save(entity);
	}

	async deleteCourse(uuid: string) {
		this.removeFolder(uuid);
		await this.courseRepository.delete({uuid});
	}

	async addPhoneme(uuid: string, dto: PhonemeCreateDto) {
		const entity = await this.courseRepository.findOneBy({uuid});
		const poster = dto.poster?.[0];
		if (poster)
			this.storeFile(uuid, `poster-${dto.name.toLocaleUpperCase()}`, poster);
		dto.poster = !!poster;
		if (!entity.phonemes) entity.phonemes = [];
		entity.phonemes.push(dto as any);
		return (await this.courseRepository.save(entity)).phonemes.find(
			p => p.name == dto.name
		);
	}

	async editPhoneme(courseUuid: string, uuid: string, dto: PhonemeCreateDto) {
		const entity = await this.phonemeRepository.findOneBy({uuid});
		const poster = dto.poster?.[0];
		if (poster)
			this.storeFile(
				courseUuid,
				`poster-${dto.name.toLocaleUpperCase()}`,
				poster
			);
		dto.poster = !!poster;
		entity.sounds = dto.sounds;
		dto.endOfWord = String(dto.endOfWord) == 'true';
		return await this.phonemeRepository.save({...entity, ...(dto as any)});
	}

	async removePhoneme(uuid: string, name: string) {
		this.removeFile(uuid, `poster-${name.toLocaleUpperCase()}`);
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.phonemes = entity.phonemes.filter(p => p.name != name);
		return await this.courseRepository.save(entity);
	}

	async removePhonemePoster(uuid: string, name: string) {
		this.removeFile(uuid, `poster-${name.toLocaleUpperCase()}`);
		const entity = (
			await this.courseRepository.findOneBy({uuid})
		).phonemes.find(p => p.name == name);
		entity.poster = null;
		await this.phonemeRepository.save(entity);
		return 'poster deleted';
	}

	async reorderItems(newOrder: string[]): Promise<Course[]> {
		const items = await this.courseRepository.find();

		if (items.length !== newOrder.length)
			throw new BadRequestException(
				"La longueur de la nouvelle séquence doit correspondre au nombre d'éléments."
			);

		newOrder.forEach(async (uuid, index) => {
			items.find(i => i.uuid == uuid).order = index;
		});
		return (await this.courseRepository.save(items)).sort(
			(a, b) => a.order - b.order
		);
	}

	async addSound(uuid: string, dto: PosterAddDto) {
		const entity = await this.courseRepository.findOneBy({uuid});
		if (!entity.sounds) entity.sounds = [];
		entity.sounds.push(dto.name);
		this.storeFile(
			uuid,
			`poster-sound-${dto.name.toLocaleUpperCase()}`,
			dto.file[0]
		);
		return await this.courseRepository.save(entity);
	}

	async removeSound(uuid: string, name: string) {
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.sounds = entity.sounds.filter(s => s != name);
		this.removeFile(uuid, `poster-sound-${name.toLocaleUpperCase()}`);
		return await this.courseRepository.save(entity);
	}

	async addPoster(uuid: string, dto: PosterAddDto) {
		const entity = await this.courseRepository.findOneBy({uuid});
		if (!entity.posterNames) entity.posterNames = [];
		entity.posterNames.push(dto.name);
		this.storeFile(uuid, `poster-${dto.name.toLocaleUpperCase()}`, dto.file[0]);
		return await this.courseRepository.save(entity);
	}

	async removePoster(uuid: string, poster: string) {
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.posterNames = entity.posterNames.filter(s => s != poster);
		this.removeFile(uuid, `poster-${poster.toLocaleUpperCase()}`);
		return await this.courseRepository.save(entity);
	}

	private removeFile(uuid: string, fileName: string) {
		fs.rmSync(`uploads/courses/${uuid}/${fileName}.pdf`, {force: true});
	}

	private removeFolder(uuid: string) {
		fs.rmSync(`uploads/courses/${uuid}`, {recursive: true, force: true});
	}

	private castAsCourse(
		dto: CourseCreateDto,
		files: CourseCreateFilesDto
	): CourseGenerator {
		if (files)
			Object.entries(files).forEach(([key, value]) => {
				dto[key] = true;
				this.storeFile(dto.uuid, key, value[0]);
			});
		return {...dto};
	}

	private async uploadFile(file: Express.Multer.File): Promise<any> {
		const bucketName = 'votre-nom-de-bucket'; // Remplacez par le nom de votre bucket

		const fileUrl = await this.storageService.uploadFile(file, bucketName);

		// Public url
		// const fileUrl = `https://f005.backblazeb2.com/file/${bucketName}/${encodeURIComponent(file.originalname)}`;
		return {
			message: 'Fichier uploadé avec succès',
			url: fileUrl,
		};
	}

	private storeFile(key: string, filename: string, data: Express.Multer.File) {
		const stream = fs.createWriteStream(
			`uploads/courses/${key}/${filename}.pdf`
		);
		stream.once('open', fd => {
			stream.write(data.buffer);
			stream.end();
		});
	}

	private isFile(prop: any): prop is Express.Multer.File {
		return prop.originalname !== undefined;
	}
}
