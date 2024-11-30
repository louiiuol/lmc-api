import {UsersService} from '@feat/users/users.service';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MailerService} from '@shared/modules/mail/mail.service';
import {Repository} from 'typeorm';
import {Newsletter, NewsletterSendDto} from './types';

@Injectable()
export class NewsletterService {
	constructor(
		private readonly users: UsersService,
		private readonly mailer: MailerService,
		@InjectRepository(Newsletter)
		private newsletterRepository: Repository<Newsletter>
	) {}

	async createNewsletter(dto: NewsletterSendDto) {
		const news = await this.newsletterRepository.save(dto);
		(await this.users.findAll())
			.filter(u => u.newsletter)
			.forEach(user => this.sendMail(dto, user.subscribed, user.email));
		return news;
	}

	async sendMail(dto: NewsletterSendDto, subscribed: boolean, email: string) {
		const content = subscribed
			? dto.content.replaceAll('\n', '<br />')
			: 'Pour lire la suite de cette newsletter, abonnez-vous !';
		await this.mailer.sendMail({
			recipient: email,
			title: dto.subject,
			template: 'newsletter',
			data: {
				intro: dto.intro,
				content,
			},
		});
	}
}
