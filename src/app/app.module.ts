import {TransformInterceptor} from '@core/interceptors/response.interceptor';
import {AuthModule} from '@core/modules/auth/auth.module';
import {AdminModule} from '@feat/admin/admin.module';
import {LibraryModule} from '@feat/library/library.module';
import {NewsletterModule} from '@feat/newsletter/newsletter.module';
import {Module} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ScheduleModule} from '@nestjs/schedule';
import {DatabaseModule} from './core/modules/database.module';
import {MailConfigModule} from './core/modules/mail-config.module';

@Module({
	imports: [
		DatabaseModule,
		MailConfigModule,
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
