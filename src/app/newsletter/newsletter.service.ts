import {Injectable, Logger} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {MailerService} from '@nestjs-modules/mailer';
import {NewsletterSendDto} from './types/dtos/newsletter-send.dto';
import {Newsletter} from './types/newsletter.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

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

	sendMail(dto: NewsletterSendDto, subscribed: boolean, email: string) {
		const title = dto.subject;
		const content = subscribed
			? dto.content.replaceAll('\n', '<br />')
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

	getNews() {
		throw new Error('Method not implemented.');
	}
}
