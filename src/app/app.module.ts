import {Module} from '@nestjs/common';
import {AuthModule} from '@core/modules/auth/auth.module';
import {LibraryModule} from '@feat/library/library.module';
import {DatabaseModule} from './core/modules/database.module';
import {MailModule} from './core/modules/mail.module';
import {NewsletterModule} from '@feat/newsletter/newsletter.module';
import {ScheduleModule} from '@nestjs/schedule';
import {AdminModule} from '@feat/admin/admin.module';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {TransformInterceptor} from '@core/interceptors/response.interceptor';

@Module({
	imports: [
		DatabaseModule,
		MailModule,
		AuthModule,
		LibraryModule,
		NewsletterModule,
		AdminModule,
		ScheduleModule.forRoot(),
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
})
export class AppModule {}
