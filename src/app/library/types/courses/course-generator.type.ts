import {PhonemeCreateDto} from '../phonemes';

export type CourseGenerator = {
	phonemes?: PhonemeCreateDto[];
	sounds?: string[];
	lesson?: boolean;
	script?: boolean;
	exercice?: boolean;
	poster?: boolean;
	words?: string[];
	color: string;
};
