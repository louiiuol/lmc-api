import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	Injectable,
	BadRequestException,
	Logger,
	HttpException,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common';
import {Response} from 'express';
import {IncomingMessage} from 'http';
import {EntityNotFoundError, QueryFailedError} from 'typeorm';
import {APIResponse} from '../types/api-response';

type CaughtExceptions =
	| QueryFailedError
	| EntityNotFoundError
	| HttpException
	| ForbiddenException
	| UnauthorizedException
	| BadRequestException;

const HttpCodes: {[key: string]: number} = {
	UnauthorizedException: 401,
	ForbiddenException: 403,
	NotFoundException: 404,
	QueryFailedError: 409,
	EntityNotFoundError: 404,
	BadRequestException: 422,
	undefined: 500,
};

/**
 * Custom exception filter to convert Exceptions thrown by the application and
 * format the response as ApiResponse object.
 * @see also @https://docs.nestjs.com/exception-filters
 */
@Injectable()
@Catch(
	QueryFailedError,
	EntityNotFoundError,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	HttpException
)
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: CaughtExceptions, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const code = this.getStatusCode(exception);

		Logger.error(`[${code}] - ${exception.message}`, 'NestApplication');
		const output: APIResponse = {
			code,
			data: null,
			message: exception.message,
			error: {
				timestamp: new Date().toISOString(),
				path: ctx.getRequest<IncomingMessage>()?.url,
				reasons: this.getErrorDetails(exception),
			},
		};

		return ctx.getResponse<Response>().status(code).json(output);
	}

	getStatusCode = (exception: CaughtExceptions) =>
		HttpCodes[exception.name] ?? (exception as any)?.code ?? 500;

	getErrorDetails = (exception: CaughtExceptions) => {
		if (exception instanceof BadRequestException) {
			return (exception.getResponse() as any).message as string[];
		}
		if (exception instanceof QueryFailedError) {
			return exception.message;
		}
		if (exception instanceof EntityNotFoundError) {
			return exception.message;
		}
		return exception.message;
	};
}
