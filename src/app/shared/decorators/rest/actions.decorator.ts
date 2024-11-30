import {
	applyDecorators,
	HttpCode,
	Delete as NestDelete,
	Get as NestGet,
	Post as NestPost,
	Patch,
	Put,
} from '@nestjs/common';

import {DocParameters} from '../../types/swagger-decorator-opt';
import {ApiOkResponseFormatted} from '../responses/api-response.decorator';
import {ApiOkResponseAsArray} from '../responses/array-response.decorator';
import {ApiOkResponsePaginated} from '../responses/paginated-response.decorator';
import {Resource} from './resource.decorator';

export const Get = (opt?: DocParameters) => {
	return applyDecorators(
		NestGet(opt?.path),
		opt?.withPagination
			? ApiOkResponsePaginated(opt?.returnType)
			: opt?.array
			? ApiOkResponseAsArray(opt?.returnType)
			: ApiOkResponseFormatted(opt?.returnType),
		...Resource(opt)
	);
};

export const Post = (opt?: DocParameters) => {
	return applyDecorators(
		NestPost(opt?.path),
		ApiOkResponseFormatted(opt?.returnType, opt?.code !== 200),
		HttpCode(opt?.code || 201),
		...Resource(opt)
	);
};

export const Update = (opt?: DocParameters) =>
	applyDecorators(
		Put(opt?.path),
		ApiOkResponseFormatted(opt?.returnType, opt?.code !== 200),
		...Resource(opt)
	);

export const PartialUpdate = (opt?: DocParameters) => {
	return applyDecorators(
		Patch(opt?.path),
		ApiOkResponseFormatted(opt?.returnType, opt?.code !== 200),
		...Resource(opt)
	);
};

export const Delete = (opt?: DocParameters) =>
	applyDecorators(
		NestDelete(opt?.path),
		ApiOkResponseFormatted(opt?.returnType, opt?.code !== 200),
		...Resource(opt)
	);
