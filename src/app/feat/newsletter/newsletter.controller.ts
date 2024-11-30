import {Body} from '@nestjs/common';
import {Controller, Post} from '@shared/decorators/rest';
import {NewsletterService} from './newsletter.service';
import {NewsletterSendDto} from './types/dtos/newsletter-send.dto';

@Controller({path: 'newsletter'})
export class NewsletterController {
	constructor(private readonly news: NewsletterService) {}

	@Post({
		description: "Envoi d'un email aux abonnés de la newsletter",
		restriction: 'admin',
		body: NewsletterSendDto,
		code: 200,
	})
	postNewsletter(@Body() dto: NewsletterSendDto) {
		return this.news.createNewsletter(dto);
	}
}
