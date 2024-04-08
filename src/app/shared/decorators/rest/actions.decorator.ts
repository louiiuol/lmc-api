import {
	applyDecorators,
	Get as NestGet,
	Post as NestPost,
	Delete as NestDelete,
	Put,
	Patch,
	HttpCode,
} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';

import {DocParameters} from '../../types/swagger-decorator-opt';
import {Resource} from './resource.decorator';
import {ApiOkResponsePaginated} from '../paginated-response.decorator';
import {ApiOkResponseFormatted} from '../api-response.decorator';
import {ApiOkResponseAsArray} from '../array-response.decorator';

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
