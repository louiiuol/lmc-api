import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {MailerService} from '@nestjs-modules/mailer';
import {NewsletterSendDto} from './dtos/newsletter-send.dto';

@Injectable()
export class NewsletterService {
	constructor(
		private readonly users: UsersService,
		private readonly mailer: MailerService
	) {}

	async sendNews(dto: NewsletterSendDto) {
		(await this.users.findAll())
			.filter(u => u.newsletter)
			.forEach(user => this.sendMail(dto, user.subscribed, user.email));
		return {message: 'Newsletter envoyée avec succès !'};
	}

	sendMail(dto: NewsletterSendDto, subscribed: boolean, email: string) {
		const title = dto.subject;
		const content = subscribed
			? dto.content
			: 'Pour lire la suite de cette newsletter, abonnez-vous !';
		this.mailer.sendMail({
			to: email,
			subject: title,
			template: 'newsletter',
			context: {
				title,
				intro: dto.intro,
				content,
			},
		});
	}
}
