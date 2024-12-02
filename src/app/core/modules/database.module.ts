import {classes} from '@automapper/classes';
import {AutomapperModule} from '@automapper/nestjs';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {environment} from 'src/app/environment';
import {Phoneme, Course} from '@feat/library/types';
import {Newsletter} from '@feat/newsletter/types/newsletter.entity';
import {User} from '@feat/users/types/user.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: environment.DATABASE_HOST,
			port: parseInt(environment.DATABASE_PORT, 10),
			username: environment.DATABASE_USER,
			password: environment.DATABASE_PASSWORD,
			database: environment.DATABASE_NAME,
			entities: [User, Phoneme, Course, Newsletter],
			synchronize: environment.DATABASE_SYNC === 'true', // should be turned off in production (overrides data)
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
	],
	exports: [TypeOrmModule, AutomapperModule],
})
export class DatabaseModule {}
