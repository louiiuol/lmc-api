import {Module} from '@nestjs/common';
import {NewsletterService} from './newsletter.service';
import {NewsletterController} from './newsletter.controller';
import {UsersModule} from '../users/users.module';
import {Newsletter} from './types/newsletter.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Newsletter])],
	providers: [NewsletterService],
	controllers: [NewsletterController],
})
export class NewsletterModule {}
