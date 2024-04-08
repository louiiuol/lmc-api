import {PipeTransform, Injectable, ArgumentMetadata} from '@nestjs/common';

@Injectable()
export class RequiredPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		return !value && value !== 0;
	}
}
