import {IsArray, ArrayNotEmpty, IsString} from 'class-validator';

export class ReorderItemsDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsString({each: true})
	readonly newOrder: string[];
}
