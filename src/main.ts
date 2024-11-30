import {useContainer} from '@nestjs/class-validator';
import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {environment} from 'src/app/environment';
import {AppModule} from './app/app.module';
import {GlobalExceptionFilter} from './app/core/exceptions/global-exceptions.filter';

import {ExpressAdapter} from '@nestjs/platform-express';
import {Callback, Context, Handler} from 'aws-lambda';
import {createServer, proxy} from 'aws-serverless-express';
import * as express from 'express';

const globalPrefix = 'api';
const port = environment.PORT || 3333;

let cachedServer;

async function bootstrapServer() {
	if (!cachedServer) {
		const expressApp = express();
		const app = await NestFactory.create(
			AppModule,
			new ExpressAdapter(expressApp)
		);
		await app.init();
		app.setGlobalPrefix(globalPrefix);

		app.useGlobalPipes(new ValidationPipe());
		useContainer(app.select(AppModule), {fallbackOnErrors: true});
		app.enableCors({
			origin: '*',
		});
		app.useGlobalFilters(new GlobalExceptionFilter());

		const config = new DocumentBuilder()
			.setTitle('La méthode claire - API doc')
			.setDescription("Documentation de l'API de la méthode claire")
			.setVersion('0.0.2')
			.setContact(
				'louiiuol',
				'https://github.com/louiiuol',
				'contact@louiiuol.dev'
			)
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api', app, document, {
			customSiteTitle: 'La méthode claire - API doc',
		});

		await app.listen(port, environment.API_HOST);
		cachedServer = createServer(expressApp);
	}
	return cachedServer;
}
const successMessage = `🚀 Application is running on: ${environment.API_HOST}:${port}/${globalPrefix}`;

export const handler: Handler = (
	event: any,
	context: Context,
	callback: Callback
) => {
	bootstrapServer().then(server => {
		return proxy(server, event, context);
	});
};
