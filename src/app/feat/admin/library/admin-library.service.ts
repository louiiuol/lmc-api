import {COURSES} from '@feat/library/courses.constant';
import {LibraryService} from '@feat/library/library.service';
import {
	Course,
	Phoneme,
	CourseCreateDto,
	CourseGenerator,
} from '@feat/library/types';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';

import {Repository} from 'typeorm';
import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs';
import {CourseCreateFilesDto} from '@feat/library/types/courses/dtos/course-create.dto';

import {CourseEditDto} from '@feat/library/types/courses/dtos/course-edit.dto';
import {SoundAddDto} from '@feat/library/types/courses/dtos/sound-add-dto';
import {PhonemeCreateDto} from '@feat/library/types/phonemes/dtos/phoneme-create.dto';

@Injectable()
export class LibraryAdminService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>,
		@InjectRepository(Phoneme) private phonemeRepository: Repository<Phoneme>,
		private readonly publicLibraryService: LibraryService
	) {}

	createLibrary = async () => {
		const phoneme = await this.phonemeRepository.find();
		const courses = await this.publicLibraryService.getAllCourses();

		await Promise.all([
			courses.map(async c => {
				await this.courseRepository.delete({uuid: c.uuid});
			}),
			phoneme.map(async p => {
				await this.phonemeRepository.delete({uuid: p.uuid});
			}),
		]);

		return COURSES.map(async (current, i) => {
			const entity = await this.courseRepository.save({...current, order: i});
			fs.cpSync(
				'library/' + (entity.order + 1),
				'uploads/courses/' + entity.uuid,
				{recursive: true}
			);
			return entity;
		});
	};

	async createCourse(dto: CourseCreateDto, files: CourseCreateFilesDto) {
		dto.uuid = uuidv4();
		// TODO Handle orders
		dto.order = (await this.courseRepository.count()) + 1;
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
		this.storeFile(
			uuid,
			`affiche-${dto.name.toLocaleUpperCase()}`,
			dto.poster[0]
		);
		dto.poster = !!dto.poster;
		entity.phonemes ??= [];
		entity.phonemes.push(dto as any);
		return await this.courseRepository.save(entity);
	}

	async removePhoneme(uuid: string, name: string) {
		this.removeFile(uuid, `affiche-${name.toLocaleUpperCase()}`);
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.phonemes = entity.phonemes.filter(p => p.name != name);
		return await this.courseRepository.save(entity);
	}

	// Move course (insert between two courses)

	async addSound(uuid: string, dto: SoundAddDto) {
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.sounds ??= [];
		entity.sounds.push(dto.name);
		this.storeFile(
			uuid,
			`affiche-son${dto.name.toLocaleUpperCase()}`,
			dto.file[0]
		);
		return await this.courseRepository.save(entity);
	}

	async removeSound(uuid: string, name: string) {
		const entity = await this.courseRepository.findOneBy({uuid});
		entity.sounds = entity.sounds.filter(s => s != name);
		this.removeFile(uuid, `affiche-son${name.toLocaleUpperCase()}`);
		return await this.courseRepository.save(entity);
	}

	private async removeFile(uuid: string, fileName: string) {
		fs.rm(`uploads/courses/${uuid}/${fileName}.pdf`, () => {});
	}

	private async removeFolder(uuid: string) {
		fs.rm(`uploads/courses/${uuid}`, () => {});
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
		dto.order ??= 0;
		return {...dto};
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
