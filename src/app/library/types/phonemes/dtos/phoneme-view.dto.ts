import {AutoMap} from '@automapper/classes';

export class PhonemeViewDto {
	@AutoMap()
	name: string;

	@AutoMap()
	poster: boolean;
}
