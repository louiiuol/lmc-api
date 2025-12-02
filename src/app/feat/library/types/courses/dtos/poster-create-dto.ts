import { ApiProperty } from '@nestjs/swagger';

export class PosterAddDto {
	@ApiProperty({ description: 'Nom du fichier' })
	name: string;

	@ApiProperty({ description: 'Fichier à stocker.' })
	file: Express.Multer.File[];
}
