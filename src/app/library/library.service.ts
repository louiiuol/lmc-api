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

	getAllCourses = async () =>
		(await this.courseRepository.find({loadEagerRelations: true})).sort(
			(a, b) => a.order - b.order
		);

	createLibrary = async () => {
		// delete all phonemes first
		(await this.phonemeRepository.find()).forEach(async p =>
			this.phonemeRepository.delete({uuid: p.uuid})
		);

		// Then, delete all courses
		(await this.getAllCourses()).forEach(
			async c => await this.courseRepository.delete({uuid: c.uuid})
		);

		// Then, generate all phonemes & courses based on local constant
		return COURSES.map((current, i) => {
			const course = new CourseCreateDto(current, i);
			return this.courseRepository.save(course);
		});
	};
}
