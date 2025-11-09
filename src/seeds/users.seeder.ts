import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User, UserRole } from '@feat/users/types';
import { environment } from 'src/app/environment';

interface SeedAccountDefinition {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
	newsletter?: boolean;
	subscribed?: boolean;
}

export interface SeedAccountResult {
	email: string;
	password: string;
	role: UserRole;
	created: boolean;
}

const SEED_ACCOUNTS: SeedAccountDefinition[] = [
	{
		firstName: 'Admin',
		lastName: 'LMC',
		email: 'admin@mail.com',
		password: 'Admin123!',
		role: UserRole.ADMIN,
		subscribed: true,
		newsletter: true,
	},
	{
		firstName: 'Camille',
		lastName: 'Lectrice',
		email: 'camille@mail.com',
		password: 'User123!',
		role: UserRole.USER,
		newsletter: true,
	},
	{
		firstName: 'Louis',
		lastName: 'Lecteur',
		email: 'louis@mail.com',
		password: 'User456!',
		role: UserRole.USER,
		subscribed: true,
		newsletter: true,
	},
];

const SALT_ROUNDS = Number(environment.SALT);

export class UsersSeeder {
	constructor(private readonly repository: Repository<User>) {}

	async run(): Promise<SeedAccountResult[]> {
		const results: SeedAccountResult[] = [];

		for (const account of SEED_ACCOUNTS) {
			const hashedPassword = await bcrypt.hash(account.password, SALT_ROUNDS);
			const existing = await this.repository.findOne({
				where: {email: account.email},
			});

			const payload: Partial<User> = {
				firstName: account.firstName,
				lastName: account.lastName,
				email: account.email,
				password: hashedPassword,
				role: account.role,
				isActive: true,
				newsletter: account.newsletter ?? false,
				subscribed: account.subscribed ?? false,
				closed: false,
				closedAt: null,
				lastConnection: null,
				currentLessonIndex: 0,
				refreshToken: null,
				updatedAt: new Date(),
			};

			if (existing) {
				await this.repository.save({...existing, ...payload});
				results.push({
					email: account.email,
					password: account.password,
					role: account.role,
					created: false,
				});
				continue;
			}

			const entity = this.repository.create({
				...payload,
				createdAt: new Date(),
			});
			await this.repository.save(entity);
			results.push({
				email: account.email,
				password: account.password,
				role: account.role,
				created: true,
			});
		}

		return results;
	}
}
