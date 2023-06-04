import {Module} from '@nestjs/common';
import {classes} from '@automapper/classes';
import {AutomapperModule} from '@automapper/nestjs';
import {TypeOrmModule} from '@nestjs/typeorm';
import {environment} from './environment';
import {User} from './users/types/user.entity';
import {AuthModule} from './auth/auth.module';
import {LibraryModule} from './library/library.module';
import {Course, Phoneme} from './library/types';

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
			synchronize: environment.PRODUCTION !== 'true', //? should be turned off in production (overrides data)
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
		AuthModule,
		LibraryModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
