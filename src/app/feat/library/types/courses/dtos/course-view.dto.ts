import {AutoMap} from '@automapper/classes';
import {ApiProperty} from '@nestjs/swagger';
import {PhonemeViewDto} from '../../phonemes/dtos/phoneme-view.dto';

export class CourseViewDto {
	@ApiProperty({description: "Index de la semaine dans l'année scolaire."})
	@AutoMap()
	order: number;

	@ApiProperty({description: 'Couleur de la semaine.', example: '#9eccd2'})
	@AutoMap()
	color: string;

	@ApiProperty({
		description: 'Graphèmes associés à cette semaine.',
		type: [PhonemeViewDto],
	})
	@AutoMap()
	phonemes: PhonemeViewDto[];

	@ApiProperty({description: 'Définit si la semaine contient un script.'})
	@AutoMap()
	script?: boolean;

	@ApiProperty({description: 'Définit si la semaine contient une leçon.'})
	@AutoMap()
	lesson?: boolean;

	@ApiProperty({description: 'Définit si la leçon contient des exercices.'})
	@AutoMap()
	exercices?: boolean;

	@ApiProperty({description: 'Définit si la leçon contient une affiche.'})
	@AutoMap()
	poster?: boolean;

	@ApiProperty({
		description: 'Liste de mots découvert au cours de la semaine.',
	})
	@AutoMap()
	words?: string[];

	@ApiProperty({
		description: 'Liste de sons découvert au cours de la semaine.',
	})
	@AutoMap()
	sounds?: string[];

	@ApiProperty({
		description: 'Noms des affiches de la semaine.',
	})
	@AutoMap()
	posterNames?: string[];
}
