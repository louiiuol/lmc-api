import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersModule} from '@feat/users/users.module';
import {NewsletterService} from './newsletter.service';
import {NewsletterController} from './newsletter.controller';
import {Newsletter} from './types/newsletter.entity';
import {MailModule} from '@shared/modules/mail/mail.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Newsletter]), MailModule],
	providers: [NewsletterService],
	controllers: [NewsletterController],
})
export class NewsletterModule {}
