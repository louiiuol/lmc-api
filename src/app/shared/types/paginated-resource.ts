import {ApiProperty} from '@nestjs/swagger';

export class PaginatedResource<T> {
	@ApiProperty({description: "Nombre total d'items dans le tableau"})
	totalItems: number;

	@ApiProperty({
		description: "Tableau d'items correspondant aux critères de recherche",
	})
	items: T[];

	@ApiProperty({description: 'Index courant de la pagination'})
	page: number;
	@ApiProperty({description: "Nombre d'éléments par page"})
	size: number;
}
