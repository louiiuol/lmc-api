import {PhonemeCreateDto} from '../../phonemes/dtos/phoneme-create.dtos';
import {CourseGenerator} from '../course-generator.type';

export class CourseCreateDto {
	name: string;

	order: number;

	phonemes: {name: string}[];

	lesson: boolean;

	script: boolean;

	exercice: boolean;

	poster: boolean;

	text: boolean;

	constructor(lesson: CourseGenerator, order: number) {
		this.order = order;
		this.phonemes = lesson.phonemes.map(
			phoneme => new PhonemeCreateDto(phoneme)
		);
	}
}
