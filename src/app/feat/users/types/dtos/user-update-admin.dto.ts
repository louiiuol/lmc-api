import {IsOptional, IsBoolean} from '@nestjs/class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class UserUpdateAdminDto {
	@ApiProperty({description: 'Définit la validité du token'})
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiProperty({
		description:
			"Définit si l'utilisateur est abonné à la méthode. Nécessaire pour accéder à l'ensemble du contenu.",
	})
	@IsOptional()
	@IsBoolean()
	subscribed?: boolean;
}
