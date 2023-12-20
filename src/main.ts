import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {ValidationPipe, Logger} from '@nestjs/common';
import {environment} from './app/environment';
import {GlobalExceptionFilter} from './app/core/exceptions/global-exceptions.filter';
import {useContainer} from '@nestjs/class-validator';

const globalPrefix = 'api';
const port = environment.PORT || 3333;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	useContainer(app.select(AppModule), {fallbackOnErrors: true});
	app.enableCors({
		origin: '*',
	});
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.setGlobalPrefix(globalPrefix);
	await app.listen(port, environment.API_HOST);
}
const successMessage = `🚀 Application is running on: ${environment.API_HOST}:${port}/${globalPrefix}`;

bootstrap()
	.then(() => Logger.log(successMessage, 'NestApplication'))
	.catch(err => Logger.error(err, 'NestApplication'));
