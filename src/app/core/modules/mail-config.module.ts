import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {Module} from '@nestjs/common';
import {join} from 'path';
import {environment} from 'src/app/environment';

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: environment.SMTP_HOST,
				port: Number(environment.SMTP_PORT),
				auth: {
					user: environment.SMTP_EMAIL,
					pass: environment.SMTP_PASS,
				},
			},
			defaults: {
				from: environment.SMTP_EMAIL,
			},
			template: {
				dir: join(__dirname, '../../../templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
	],
	exports: [MailerModule],
})
export class MailConfigModule {}
