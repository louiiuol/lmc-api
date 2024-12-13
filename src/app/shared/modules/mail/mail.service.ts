import {MailerService as NestMailerService} from '@nestjs-modules/mailer';
import {BadRequestException, Injectable} from '@nestjs/common';

export type MailConfig = {
	recipient: string;
	title: string;
	template: string;
	data?: any;
};

@Injectable()
export class MailerService {
	constructor(private readonly mailer: NestMailerService) {}

	async sendMail(opt: MailConfig) {
		try {
			await this.mailer.sendMail({
				to: opt.recipient,
				subject: opt.title,
				template: opt.template,
				context: {
					title: opt.title,
					...opt.data,
				},
			});
		} catch (e) {
			console.error('Error sending email:', e.message);
			throw new BadRequestException(e, {
				cause: e,
				description: "Impossible d'envoyer le message.",
			});
		}
	}
}
