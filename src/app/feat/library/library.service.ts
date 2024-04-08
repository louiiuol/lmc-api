import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Course, CourseCreateDto, Phoneme} from './types';
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
		const phoneme = await this.phonemeRepository.find();
		const courses = await this.getAllCourses();

		await Promise.all([
			phoneme.map(async p => {
				await this.phonemeRepository.delete({uuid: p.uuid});
			}),
			courses.map(async c => {
				await this.courseRepository.delete({uuid: c.uuid});
			}),
		]);

		return COURSES.map((current, i) => {
			const course = new CourseCreateDto(current, i);
			return this.courseRepository.save(course);
		});
	};
}
