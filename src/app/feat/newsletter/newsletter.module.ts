import {UsersModule} from '@feat/users/users.module';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MailModule} from '@shared/modules/mail/mail.module';
import {NewsletterController} from './newsletter.controller';
import {NewsletterService} from './newsletter.service';
import {Newsletter} from './types/newsletter.entity';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Newsletter]), MailModule],
	providers: [NewsletterService],
	controllers: [NewsletterController],
})
export class NewsletterModule {}
