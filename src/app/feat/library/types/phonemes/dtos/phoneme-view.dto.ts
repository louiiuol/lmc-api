import {AutoMap} from '@automapper/classes';
import {ApiProperty} from '@nestjs/swagger';

export class PhonemeViewDto {
	@ApiProperty({description: 'Nom du digramme.'})
	@AutoMap()
	name: string;

	@ApiProperty({
		description: "Définit si le digramme est accompagné d'une affiche.",
	})
	@AutoMap()
	poster: boolean;

	@ApiProperty({
		description: 'Définit si le digramme est utilisé en fin de mot.',
	})
	@AutoMap()
	endOfWord?: boolean;

	@ApiProperty({
		description: 'Liste des sons associés à ce digramme.',
	})
	@AutoMap()
	sounds?: string[];

	@ApiProperty({
		description: 'Noms des affiches associé à ce digramme.',
	})
	@AutoMap()
	posterNames?: string[];

	@ApiProperty({
		description: 'Informations supplémentaire à propos de ce digramme',
	})
	@AutoMap()
	info: string;
}
