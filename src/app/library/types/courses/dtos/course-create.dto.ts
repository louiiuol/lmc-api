import {CourseGenerator} from '../course-generator.type';
import {PhonemeCreateDto} from '../../phonemes/dtos/phoneme-create.dtos';

export class CourseCreateDto {
	name: string;

	order: number;

	phonemes: unknown[];

	lesson: string;

	script: string;

	exercice: string;

	poster?: string;

	text?: string;

	constructor(lesson: CourseGenerator, i: number) {
		const path = `assets/pdf/lessons/leçon${lesson.phonemes
			.reduce((p, t) => p.concat(t.toLocaleUpperCase()), [])
			.join('-')}/`;
		this.name = lesson.phonemes.join(' ');
		this.order = i;
		this.lesson = path + 'leçon.pdf';
		this.script = path + 'script.pdf';
		this.exercice = path + 'exercices.pdf';
		if (lesson.poster) this.poster = path + 'poster.pdf';
		if (lesson.text) this.text = path + 'texte.pdf';
		this.phonemes = lesson.phonemes.map(
			phoneme => new PhonemeCreateDto(phoneme, path)
		);
	}
}
