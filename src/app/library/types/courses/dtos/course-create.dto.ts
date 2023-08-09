import {PhonemeCreateDto} from '../../phonemes/dtos/phoneme-create.dto';
import {CourseGenerator} from '../course-generator.type';

export class CourseCreateDto {
	order?: number;

	color: string;

	phonemes?: {name: string}[];

	lesson?: boolean;

	script?: boolean;

	exercice?: boolean;

	poster?: boolean;

	text?: boolean;

	words: string[];

	constructor(lesson: CourseGenerator, order: number) {
		this.order = order;
		this.phonemes = lesson.phonemes.map(
			phoneme => new PhonemeCreateDto(phoneme)
		);
		this.script = lesson.script;
		this.lesson = lesson.lesson;
		this.exercice = lesson.exercice;
		this.poster = lesson.poster;
		this.text = lesson.text;
		this.words = lesson.words ?? [];
		this.color = lesson.color;
	}
}
