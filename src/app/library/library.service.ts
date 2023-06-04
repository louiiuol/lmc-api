import {Injectable} from '@nestjs/common';
import {Course, CourseCreateDto} from './types';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {COURSES} from './courses.constant';

@Injectable()
export class LibraryService {
	constructor(
		@InjectRepository(Course) private courseRepository: Repository<Course>
	) {}

	getAllCourses = async () => this.courseRepository.find();

	createLibrary = async () => {
		return await COURSES.map(async (current, i) => {
			const lesson = new CourseCreateDto(current, i);
			return await this.courseRepository.save(lesson);
		});
	};
}
