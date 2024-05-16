import {PhonemeGenerateDto} from '../phonemes';

export type CourseGenerator = {
	uuid?: string;
	phonemes?: PhonemeGenerateDto[];
	sounds?: string[];
	lesson?: boolean;
	script?: boolean;
	exercices?: boolean;
	poster?: boolean;
	words?: string[];
	color: string;
};
