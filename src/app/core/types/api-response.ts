/**
 * Represents wrapper for every response from API
 */
export interface APIResponse {
	code: number;
	data: any;
	message: string;
	error?: {
		timestamp: Date | string;
		path: string;
		reasons: string | string[] | APIFormErrorDetails[];
	};
}

type APIFormErrorDetails = {
	field: string;
	errors: {error: ValidationFormError; reason: string}[];
};

type ValidationFormError =
	| 'UNIQUE_KEY'
	| 'REQUIRED'
	| 'MIN'
	| 'MAX'
	| 'PATTERN'
	| 'MIN_LENGTH'
	| 'MAX_LENGTH';
