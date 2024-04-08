// Get local `.env` file to configure app
import * as dotenv from 'dotenv';
dotenv.config();

export const environment = process.env;
