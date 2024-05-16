import {IsNumber, IsOptional, IsString} from '@nestjs/class-validator';

import {ApiProperty} from '@nestjs/swagger';

export class CourseEditDto {
	uuid: string;

	@ApiProperty({description: 'Index de la semaine'})
	@IsNumber()
	@IsOptional()
	order?: number;

	@ApiProperty({
		description: 'Couleur primaire de la semaine.',
		example: '#a45efd',
	})
	@IsString()
	@IsOptional()
	color: string;

	@ApiProperty({description: 'Mots associé à la semaine'})
	words?: string[];

	script: boolean;

	lesson?: boolean;

	exercices?: boolean;
	poster?: boolean;
}

export class CourseEditFilesDto {
	@ApiProperty({description: 'Leçon de la semaine'})
	lesson?: Express.Multer.File[];

	@ApiProperty({description: 'Script de la semaine'})
	script: Express.Multer.File[];

	@ApiProperty({description: 'Exercices de la semaine'})
	exercices?: Express.Multer.File[];

	@ApiProperty({description: 'Affiche de la semaine'})
	poster?: Express.Multer.File[];
}
