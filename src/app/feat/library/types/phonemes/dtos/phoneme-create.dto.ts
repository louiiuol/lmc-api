export class PhonemeCreateDto {
	name: string;
	poster?: Express.Multer.File[] | boolean;
	endOfWord?: boolean;
	sounds?: string[];
	info?: string;
}
