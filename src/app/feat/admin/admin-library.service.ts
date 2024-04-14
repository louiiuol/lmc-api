import {COURSES} from '@feat/library/courses.constant';
import {LibraryService} from '@feat/library/library.service';
import {Course, Phoneme, CourseCreateDto} from '@feat/library/types';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

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
