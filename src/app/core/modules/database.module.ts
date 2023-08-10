import {classes} from '@automapper/classes';
import {AutomapperModule} from '@automapper/nestjs';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {environment} from 'src/app/environment';
import {Phoneme, Course} from 'src/app/library/types';
import {User} from 'src/app/users/types/user.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: environment.DATABASE_HOST,
			port: parseInt(environment.DATABASE_PORT, 10),
			username: environment.DATABASE_USER,
			password: environment.DATABASE_PASSWORD,
			database: environment.DATABASE_NAME,
			entities: [User, Phoneme, Course],
			synchronize: environment.DATABASE_SYNC === 'true', // should be turned off in production (overrides data)
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
	],
	exports: [TypeOrmModule, AutomapperModule],
})
export class DatabaseModule {}
