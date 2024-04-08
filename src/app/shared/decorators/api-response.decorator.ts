import {Type, applyDecorators} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiExtraModels,
	ApiOkResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import {APISuccessResponse} from '@shared/types/api-response';

export const ApiOkResponseFormatted = <DataDto extends Type<unknown>>(
	dataDto: DataDto | undefined,
	created = false
) => {
	const scheme = {
		schema: {
			allOf: [
				{$ref: getSchemaPath(APISuccessResponse)},
				{
					properties: {
						data: dataDto ? {$ref: getSchemaPath(dataDto)} : null,
					},
				},
			],
		},
	};
	const arrayScheme = {
		schema: {
			allOf: [
				{$ref: getSchemaPath(APISuccessResponse)},
				{
					properties: {
						data: dataDto
							? {data: {$ref: getSchemaPath(dataDto), type: 'array'}}
							: null,
					},
				},
			],
		},
	};
	const decorators = [];
	if (dataDto) decorators.push(ApiExtraModels(APISuccessResponse, dataDto));
	return applyDecorators(
		...decorators,
		!created ? ApiOkResponse(scheme) : ApiCreatedResponse(scheme)
	);
};
