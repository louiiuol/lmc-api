import {Body, Controller, Get, HttpCode, Post, UseGuards} from '@nestjs/common';
import {AdminGuard} from '../auth/guards/roles/admin.guard';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {NewsletterService} from './newsletter.service';
import {NewsletterSendDto} from './types/dtos/newsletter-send.dto';

@Controller('newsletter')
export class NewsletterController {
	constructor(private readonly news: NewsletterService) {}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get('')
	getNewsletters() {
		return this.news.getNews();
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Post('')
	@HttpCode(200)
	postNewsletter(@Body() dto: NewsletterSendDto) {
		return this.news.createNewsletter(dto);
	}
}
