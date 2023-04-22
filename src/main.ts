import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { environment } from './app/environment';
import { GlobalExceptionFilter } from './app/core/exceptions/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = environment.API_PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://${environment.API_HOST}:${port}/${globalPrefix}`,
  );
}
bootstrap();
