/* import {
	ApiOkResponse,
	ApiAcceptedResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse,
	ApiNoContentResponse,
} from '@nestjs/swagger';
import {SwaggerResponse} from '../swagger.decorator';
import {DocParameters} from '../../types/swagger-decorator-opt';

export const BaseDecorators = (opt: DocParameters) => [
	ApiOkResponse(SwaggerResponse.success(opt.description, opt.returnType)),
	ApiAcceptedResponse(SwaggerResponse.success()),
	ApiNotFoundResponse(SwaggerResponse.notFoundError()),
	ApiBadRequestResponse(SwaggerResponse.badRequestError()),
	ApiNoContentResponse(SwaggerResponse.noContent()),
];
*/
