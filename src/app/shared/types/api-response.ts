import {ApiProperty} from '@nestjs/swagger';

export class APISuccessResponse<T = unknown> {
	@ApiProperty({description: 'Status de la requête', example: 200})
	code: number;
	data?: T | T[] | null;
	@ApiProperty({example: 'Requête effectuée avec succès'})
	message: string;
}
/**
 * Wrapper for every response from API
 */
export class APIErrorResponse {
	@ApiProperty({description: 'Status de la requête.'})
	code: number;
	@ApiProperty({
		description: "Explication sommaire de l'erreur.",
		example: 'Requête effectuée avec succès',
	})
	message: string;
	@ApiProperty()
	data: null;
	@ApiProperty({description: "Détails de l'erreur.", type: 'object'})
	error: {
		timestamp: Date | string;
		path: string;
		reasons: string | string[] | APIFormErrorDetails[];
	};
}

export class APIFormErrorDetails {
	@ApiProperty()
	field: string;
	@ApiProperty()
	errors: {error: ValidationFormError; reason: string}[];
}

type ValidationFormError =
	| 'UNIQUE_KEY'
	| 'REQUIRED'
	| 'MIN'
	| 'MAX'
	| 'PATTERN'
	| 'MIN_LENGTH'
	| 'MAX_LENGTH';
