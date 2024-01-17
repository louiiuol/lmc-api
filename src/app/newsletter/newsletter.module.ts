import {Module} from '@nestjs/common';
import {NewsletterService} from './newsletter.service';
import {NewsletterController} from './newsletter.controller';
import {UsersModule} from '../users/users.module';

@Module({
	imports: [UsersModule],
	providers: [NewsletterService],
	controllers: [NewsletterController],
})
export class NewsletterModule {}
