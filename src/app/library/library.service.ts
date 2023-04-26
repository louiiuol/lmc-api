import {Injectable} from '@nestjs/common';
import {Course, CourseCreateDto, Phoneme} from './types';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {COURSES} from './courses.constant';

@Injectable()
export class LibraryService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>,
		@InjectRepository(Phoneme) private phonemeRepository: Repository<Phoneme>
	) {}

	createPhoneme = async (name: string, poster: string): Promise<string> =>
		(await this.phonemeRepository.save({name, poster})).uuid;

	getAllCourses = async () => this.courseRepository.find();

	createLibrary = async () => {
		COURSES.forEach(async (current, i) => {
			const lesson = new CourseCreateDto(current, i);
			lesson.phonemes.forEach(
				async entity => await this.phonemeRepository.save(entity)
			);
			await this.courseRepository.save(lesson);
		});
	};
}
