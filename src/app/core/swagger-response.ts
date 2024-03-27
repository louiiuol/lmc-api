export const SwaggerResponse = {
	created: (description?: string) => ({
		schema: {
			example: {data: {}, code: 201},
		},
		status: 201,
		description: description || `Object has been created successfully !`,
	}),
	success: (description?: string) => ({
		schema: {
			example: {data: {}, code: 200},
		},
		status: 200,
		description: description || 'Request made with success',
	}),
	noContent: (description?: string) => ({
		schema: {
			example: {data: null, code: 204},
		},
		status: 204,
		description: description || 'Request made with success',
	}),
	notFoundError: (description?: string) => ({
		schema: {
			example: {
				code: 404,
				errors: [],
				message: 'Not Found',
			},
		},
		status: 404,
		description: description || 'Object Not Found!',
	}),
	badRequestError: (description?: string) => ({
		schema: {
			example: {
				code: 422,
				errors: [],
				message: 'Validator error',
			},
		},
		status: 422,
		description: description || 'Validator error',
	}),
	unauthorizedError: (description?: string) => ({
		schema: {
			example: {
				code: 401,
				error: 'Unauthorized',
			},
		},
		status: 401,
		description: description || 'Unauthorized',
	}),
};
