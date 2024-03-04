import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {Cron} from '@nestjs/schedule';
import {isXMonthEarlier} from '../core/helpers';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class AdminUsersService {
	constructor(
		private readonly users: UsersService,
		private readonly mailerService: MailerService
	) {}

	resetSubscriptions = async () => {
		(await this.users.findAll())
			.map(user => {
				user.subscribed = false;
				return user;
			})
			.forEach(
				async user =>
					await this.users.update(user.uuid, {subscribed: user.subscribed})
			);
		return {message: 'SUBSCRIPTION_RESEATED'};
	};

	exportEmails = async () => ({
		emails: (await this.users.findAll()).map(user => user.email).join(', '),
	});

	@Cron('0 1 * * *')
	async handleClosedAccounts() {
		(await this.users.findAll())
			.filter(u => u.closed && u.role === 'USER')
			.forEach(async user => {
				if (isXMonthEarlier(user.closedAt)) {
					const title = 'Fermeture de votre compte.';
					this.mailerService.sendMail({
						to: user.email,
						subject: title,
						template: 'closing-account',
						context: {
							title,
							summary:
								"Vous avez récemment demandé(e) la fermeture de votre compte. Celui-ci sera supprimé dans 1 mois. Si vous souhaitez rouvrir votre compte, il vous suffit de vous reconnecter à l'application",
						},
					});
				} else if (isXMonthEarlier(user.closedAt, 2)) {
					await this.users.remove(user.uuid);
				}
			});
		const title = 'Cron Job running: Verifying closed account';
		this.mailerService.sendMail({
			to: 'louis.godlewski@gmail.com',
			subject: title,
			template: 'running-job',
			context: {
				title,
			},
		});
	}
}
