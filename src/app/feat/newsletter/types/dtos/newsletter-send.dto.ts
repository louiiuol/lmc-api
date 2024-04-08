import {IsString} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class NewsletterSendDto {
	@ApiProperty({description: 'Sujet du mail à envoyer'})
	@IsString()
	subject: string;

	@ApiProperty({description: 'Introduction publique de la newsletter'})
	@IsString()
	intro: string;

	@ApiProperty({description: 'Contenu de la newsletter, réservé aux abonnés.'})
	@IsString()
	content: string;
}
