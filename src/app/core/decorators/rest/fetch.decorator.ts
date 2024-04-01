import {applyDecorators, Get, UseGuards} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiOperation,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {DocParameters} from '../../types/swagger-decorator-opt';
import {BaseDecorators} from './base.decorator';

export const Fetch = (opt: DocParameters) => {
	const decorators = [];
	const responses = [];
	const operations = {
		summary: opt.description ?? 'Aucune description fournie',
	};

	if (opt.returnType) operations['type'] = opt.returnType;

	if (opt.guards?.length) decorators.push(UseGuards(...opt.guards));

	if (opt.guards?.length || (opt.level && opt.level !== 'public')) {
		ApiBearerAuth(opt.level);
		responses.push(ApiForbiddenResponse(), ApiUnauthorizedResponse());
	}

	if (opt.description) decorators.push(ApiOperation(operations));

	return applyDecorators(
		Get(opt.path),
		...decorators,
		...responses,
		...BaseDecorators(opt)
	);
};
