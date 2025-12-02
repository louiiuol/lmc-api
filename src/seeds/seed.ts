import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { User } from '@feat/users/types';
import { AppModule } from 'src/app/app.module';
import { SeedAccountResult, UsersSeeder } from './users.seeder';

const logReport = (report: SeedAccountResult[]) => {
	console.log('=== Comptes créés / mis à jour ===');
	console.table(
		report.map(account => ({
			email: account.email,
			password: account.password,
			role: account.role,
			status: account.created ? 'créé' : 'mis à jour',
		}))
	);
	console.log(
		'\nUtilisez ces identifiants pour vous connecter à l’interface (mots de passe affichés en clair ci-dessus).'
	);
};

async function bootstrap() {
	const context = await NestFactory.createApplicationContext(AppModule, {
		logger: ['error', 'warn'],
	});
	try {
		const dataSource = context.get(DataSource);
		const usersRepository = dataSource.getRepository(User);
		const seeder = new UsersSeeder(usersRepository);
		const report = await seeder.run();
		logReport(report);
	} finally {
		await context.close();
	}
}

bootstrap().catch(error => {
	console.error('Seed failed', error);
	process.exit(1);
});
