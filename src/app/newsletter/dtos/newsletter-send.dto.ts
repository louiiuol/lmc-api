import {IsString} from '@nestjs/class-validator';

export class NewsletterSendDto {
	@IsString()
	subject: string;

	@IsString()
	intro: string;

	@IsString()
	content: string;
}
