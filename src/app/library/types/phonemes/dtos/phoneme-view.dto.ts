import {AutoMap} from '@automapper/classes';

export class PhonemeViewDto {
	@AutoMap()
	name: string;

	@AutoMap()
	poster: boolean;

	@AutoMap()
	endOfWord?: boolean;

	@AutoMap()
	sounds?: string[];

	@AutoMap()
	posterNames?: string[];

	@AutoMap()
	info: string;
}
