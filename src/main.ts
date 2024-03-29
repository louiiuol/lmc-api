import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {ValidationPipe, Logger} from '@nestjs/common';
import {environment} from './app/environment';
import {GlobalExceptionFilter} from './app/core/exceptions/global-exceptions.filter';
import {useContainer} from '@nestjs/class-validator';
// import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

const globalPrefix = 'api';
const port = environment.PORT || 3333;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix(globalPrefix);

	app.useGlobalPipes(new ValidationPipe());
	useContainer(app.select(AppModule), {fallbackOnErrors: true});
	app.enableCors({
		origin: '*',
	});
	app.useGlobalFilters(new GlobalExceptionFilter());

	/** const config = new DocumentBuilder()
		.setTitle('La méthode claire - API doc')
		.setDescription("Documentation de l'API de la méthode claire")
		.setVersion('0.0.2')
		.setContact(
			'louiiuol',
			'https://github.com/louiiuol',
			'contact@louiiuol.dev'
		)
		.addBearerAuth()
		.setBasePath('api')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
*/
	await app.listen(port, environment.API_HOST);
}
const successMessage = `🚀 Application is running on: ${environment.API_HOST}:${port}/${globalPrefix}`;

bootstrap()
	.then(() => Logger.log(successMessage, 'NestApplication'))
	.catch(err => Logger.error(err, 'NestApplication'));
