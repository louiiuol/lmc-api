import {AutoMap} from '@automapper/classes';
import {PhonemeViewDto} from '../../phonemes/dtos/phoneme-view.dto';

export class CourseViewDto {
	@AutoMap()
	order: number;

	@AutoMap()
	color: string;

	@AutoMap()
	phonemes: PhonemeViewDto[];

	@AutoMap()
	script?: boolean;

	@AutoMap()
	lesson?: boolean;

	@AutoMap()
	text?: boolean;

	@AutoMap()
	exercice?: boolean;

	@AutoMap()
	poster?: boolean;

	@AutoMap()
	words: string[];
}
