import {Type, applyDecorators} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, getSchemaPath} from '@nestjs/swagger';
import {APISuccessResponse} from '@shared/types/api-response';
import {PaginatedResource} from '@shared/types/paginated-resource';

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(
	dataDto: DataDto
) =>
	applyDecorators(
		ApiExtraModels(APISuccessResponse, PaginatedResource, dataDto),
		ApiOkResponse({
			schema: {
				allOf: [
					{$ref: getSchemaPath(APISuccessResponse)},
					{
						properties: {
							data: {
								type: 'object',
								allOf: [
									{$ref: getSchemaPath(PaginatedResource)},
									{
										properties: {
											items: {
												type: 'array',
												items: {$ref: getSchemaPath(dataDto)},
											},
										},
									},
								],
							},
						},
					},
				],
			},
		})
	);
