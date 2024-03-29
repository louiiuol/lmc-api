/* import {Get, Type, applyDecorators} from '@nestjs/common';
import {ApiOperation} from '@nestjs/swagger';
import {DocParameters} from '../types/swagger-decorator-opt';

/**
 * Decorator easing swagger integration.
 * @param opt configuration to apply to documentation
 * @returns Decorators to apply to following function
 */

/*
export const Resource = (opt?: DocParameters) =>
	applyDecorators(ApiOperation({summary: opt?.description}), Get());

export const SwaggerResponse = {
	created: (description?: string) => ({
		status: 201,
		description: description || `Objet créé avec succès !`,
	}),
	success: (description?: string, type?: Type<unknown>) => ({
		type,
		status: 200,
		description: description || 'Requête effectué avec succès',
	}),
	noContent: (description?: string) => ({
		status: 204,
		description: description || 'No content',
	}),
	notFoundError: (description?: string) => ({
		status: 404,
		description: description || 'Not found',
	}),
	badRequestError: (description?: string) => ({
		status: 422,
		description: description || 'Validator error',
	}),
	unauthorizedError: (description?: string) => ({
		status: 401,
		description: description || 'Unauthorized',
	}),
	forbiddenError: (description?: string) => ({
		status: 403,
		description: description || 'Unauthorized',
	}),
};
*/
