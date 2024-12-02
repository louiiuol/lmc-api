import {
	ApiNoContentResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
	ApiOperation,
	ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {UseGuards} from '@nestjs/common';
import {DocParameters} from '@shared/types/swagger-decorator-opt';
import {ResponseMessage} from '../responses/response-message.decorator';
import {APIFormErrorDetails} from '@shared/types/api-response';
import {LocalAuthGuard} from '@core/modules/auth/guards/local/local.guard';
import {
	AdminGuard,
	JwtAuthGuard,
	RefreshTokenGuard,
} from '@core/modules/auth/guards';

const appGuards = {
	refresh: [RefreshTokenGuard],
	user: [JwtAuthGuard],
	admin: [JwtAuthGuard, AdminGuard],
	local: [LocalAuthGuard],
};

const createSchema = (
	path: string,
	code: number,
	message: string,
	reasons?: string | string[] | APIFormErrorDetails[]
) => ({
	example: {
		code,
		data: null,
		message,
		error: {
			timestamp: new Date(),
			path: `/api/${path}`,
			reasons: reasons ?? message,
		},
	},
});

const SwaggerResponse = {
	created: (opt?: DocParameters) => ({
		code: 200,
		type: opt?.returnType,
		status: opt?.code ?? 201,
		description: `Objet créé avec succès`,
	}),
	success: (opt?: DocParameters) => {
		const T = opt?.returnType;
		return {
			type: T,
			status: opt?.code || 200,
			description: 'Requête effectuée avec succès',
		};
	},
	noContent: (opt?: DocParameters) => ({
		status: 204,
		description: 'Aucun contenu',
		schema: createSchema(opt.path, 204, 'Aucun contenu trouvé'),
	}),
	notFoundError: (opt?: DocParameters) => ({
		status: 404,
		description: "Cette ressource n'existe pas",
		schema: createSchema(
			opt.path,
			404,
			"Cette ressource n'existe pas",
			'Aucun contenu trouvé. Merci de vérifier vos entrées'
		),
	}),
	badRequestError: (opt?: DocParameters) => ({
		status: 422,
		schema: createSchema(opt.path, 422, 'Le formulaire est invalide.', [
			'Le champ email est obligatoire',
		]),
		description: 'Erreur de validation',
	}),
	unauthorizedError: (opt?: DocParameters) => ({
		status: 401,
		description: 'Expiration du token',
		schema: createSchema(
			opt.path,
			401,
			'Expiration du token',
			'Token invalide ou expiré'
		),
	}),
	forbiddenError: (opt?: DocParameters) => ({
		status: 403,
		description: 'Permissions insuffisantes',
		schema: createSchema(
			opt.path,
			403,
			'Permissions insuffisantes',
			"Vous ne disposez d'un niveau d'accès suffisant pour accéder à cette ressource"
		),
	}),
};

export const Resource = (opt?: DocParameters) => {
	const decorators = [];
	const responses = [];
	const operations = {
		summary: opt.description ?? 'Aucune description fournie',
	};
	if (opt?.body)
		decorators.push(
			ApiUnprocessableEntityResponse(SwaggerResponse.badRequestError(opt))
		);

	if (opt?.restriction) {
		decorators.push(UseGuards(...appGuards[opt.restriction]));
		if (['user', 'admin', 'refresh'].includes(opt.restriction))
			decorators.push(ApiBearerAuth());
		responses.push(
			ApiForbiddenResponse(SwaggerResponse.forbiddenError(opt)),
			ApiUnauthorizedResponse(SwaggerResponse.unauthorizedError(opt))
		);
	}

	if (opt?.success) decorators.push(ResponseMessage(opt?.success));

	if (opt?.returnType) operations['type'] = opt.returnType;

	if (opt?.description) decorators.push(ApiOperation(operations));

	if (opt?.noContent)
		decorators.push(ApiNoContentResponse(SwaggerResponse.noContent(opt)));

	return [...decorators, ...responses];
};
