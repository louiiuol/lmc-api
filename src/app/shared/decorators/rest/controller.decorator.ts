import {applyDecorators, Controller as NestController} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {capitalize} from '@shared/helpers';

export const Controller = (opt?: {path?: string; name?: string}) =>
	applyDecorators(
		NestController(opt.path),
		ApiTags(opt.name ?? capitalize(opt.path))
	);
