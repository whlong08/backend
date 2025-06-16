import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = exception;

    if (error instanceof HttpException) {
      status = error.getStatus();
      const res = error.getResponse();
      if (typeof res === 'string') message = res;
      else if (typeof res === 'object' && res && (res as any).message) message = (res as any).message;
    } else if (error && error.message) {
      message = error.message;
    }

    this.logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, error.stack);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
