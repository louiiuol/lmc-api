import {Type, applyDecorators} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, getSchemaPath} from '@nestjs/swagger';
import {APISuccessResponse} from '@shared/types/api-response';

export const ApiOkResponseAsArray = <DataDto extends Type<unknown>>(
	dataDto: DataDto
) =>
	applyDecorators(
		ApiExtraModels(APISuccessResponse, dataDto),
		ApiOkResponse({
			schema: {
				allOf: [
					{$ref: getSchemaPath(APISuccessResponse)},
					{
						properties: {
							data: {
								type: 'array',
								items: {$ref: getSchemaPath(dataDto)},
							},
						},
					},
				],
			},
		})
	);
