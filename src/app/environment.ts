// Get local `.env` file to configure app
import * as dotenv from 'dotenv';
import {z} from 'zod';
dotenv.config();

export const environmentSchema = z.object({
	PRODUCTION: z.string(),
	API_HOST: z.string(),
	API_HOST_FULL: z.string(),
	PORT: z.string(),
	API_PREFIX: z.string(),
	JWT_SECRET_KEY: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	SALT: z.string(),
	DATABASE_HOST: z.string(),
	DATABASE_PORT: z.string(),
	DATABASE_USER: z.string(),
	DATABASE_PASSWORD: z.string(),
	DATABASE_NAME: z.string(),
	DATABASE_SYNC: z.string(),
	SMTP_HOST: z.string(),
	SMTP_PORT: z.string(),
	SMTP_EMAIL: z.string(),
	SMTP_PASS: z.string(),
	WEB_UI_URL: z.string(),
});

export type Environment = z.infer<typeof environmentSchema>;

try {
	environmentSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {
		console.error(
			'Missing following env variables: ',
			error.errors.map(e => e.path).join(', ')
		);
	}
	process.exit(1);
}
export const environment = process.env as Environment;
