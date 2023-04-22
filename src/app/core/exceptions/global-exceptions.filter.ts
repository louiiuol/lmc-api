import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { IncomingMessage } from 'http';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export const getErrorMessage = (exception: unknown): string =>
  String(exception);

/**
 ** Custom exception filter to convert EntityNotFoundError from TypeOrm to NestJs responses
 * @see also @https://docs.nestjs.com/exception-filters
 */
@Injectable()
@Catch(QueryFailedError, EntityNotFoundError)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IncomingMessage>();
    console.log(exception);
    const message = getErrorMessage(exception);

    return response.status(0).json({
      error: {
        timestamp: new Date().toISOString(),
        path: request.url,
        code: 0,
        message,
      },
    });
  }
}
