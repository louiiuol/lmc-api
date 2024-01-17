import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {LibraryModule} from './library/library.module';
import {DatabaseModule} from './core/modules/database.module';
import {MailModule} from './core/modules/mail.module';
import {NewsletterModule} from './newsletter/newsletter.module';

@Module({
	imports: [
		DatabaseModule,
		MailModule,
		AuthModule,
		LibraryModule,
		NewsletterModule,
	],
})
export class AppModule {}
