import {CourseGenerator} from '../course-generator.type';
import {Phoneme} from '../../phonemes';
import {PhonemeCreateDto} from '../../phonemes/dtos/phoneme-create.dtos';

export class CourseCreateDto {
	name: string;

	phonemes: unknown[];

	lesson: string;

	script: string;

	exercice: string;

	poster?: string;

	text?: string;

	constructor(lesson: CourseGenerator, i: number) {
		const path = `assets/leçon${i}${lesson.phonemes
			.reduce((p, t) => p.concat(t.toLocaleUpperCase()), [])
			.join('-')}/`;
		this.name = lesson.phonemes.join(' ');
		this.lesson = path + 'leçon.pdf';
		this.script = path + 'script.pdf';
		this.exercice = path + 'exercice.pdf';
		if (lesson.poster) this.poster = path + 'poster.pdf';
		if (lesson.text) this.text = path + 'text.pdf';
		this.phonemes = lesson.phonemes.map(
			phoneme => new PhonemeCreateDto(phoneme, path)
		);
	}
}
