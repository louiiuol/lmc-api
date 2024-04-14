import {MailerModule} from '@nestjs-modules/mailer';
import {Module} from '@nestjs/common';
import {MailerService} from './mail.service';

@Module({
	imports: [MailerModule],
	providers: [MailerService],
	exports: [MailerService],
})
export class MailModule {}
