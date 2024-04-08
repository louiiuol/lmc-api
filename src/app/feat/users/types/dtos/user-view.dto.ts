import {AutoMap} from '@automapper/classes';
import {UserRole} from '../user.role';
import {ApiProperty} from '@nestjs/swagger';

export class UserViewDto {
	@ApiProperty({
		description: "Numéro d'identification",
		example: 'f7398d9f-e52b-4ey8-b3be-ee6fa99e48a61n3',
	})
	@AutoMap()
	uuid: string;

	@ApiProperty({
		description: 'Contact',
		uniqueItems: true,
		example: 'example@mail.com',
	})
	@AutoMap()
	email: string;

	@ApiProperty({
		description: 'Prénom',
		example: 'John',
	})
	@AutoMap()
	firstName: string;

	@ApiProperty({
		description: 'Nom',
		example: 'Doe',
	})
	@AutoMap()
	lastName: string;

	@ApiProperty({
		description: 'Définit la validité du token',
	})
	@AutoMap()
	isActive: boolean;

	@ApiProperty({
		description: "Rôle de l'utilisateur. Définit ses permissions.",
		example: 'USER',
	})
	@AutoMap()
	role: UserRole;

	@ApiProperty({
		description:
			"Index de la semaine courante de l'utilisateur dans la méthode.",
	})
	@AutoMap()
	currentLessonIndex: number;

	@ApiProperty({
		description:
			"Définit si l'utilisateur est abonné à la méthode. Nécessaire pour accéder à l'ensemble du contenu.",
	})
	@AutoMap()
	subscribed: boolean;

	@ApiProperty({
		description: "Définit si l'utilisateur est abonné à la newsletter.",
	})
	@AutoMap()
	newsletter: boolean;

	@ApiProperty({description: 'Date de création du compte.'})
	@AutoMap()
	createdAt: Date;

	@ApiProperty({description: 'Date de la dernière mise à jour du compte.'})
	@AutoMap()
	updatedAt: Date;

	@ApiProperty({description: "Date de la dernière connection de l'utilisateur"})
	@AutoMap()
	lastConnection: Date;

	@ApiProperty({
		description: 'Définit si le compte est fermée.',
	})
	@AutoMap()
	closed: boolean;

	@ApiProperty({description: 'Date de fermeture du compte.'})
	@AutoMap()
	closedAt: Date;
}
