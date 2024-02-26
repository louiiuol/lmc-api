import {AutoMap} from '@automapper/classes';
import {UserRole} from '../user.role';

export class UserViewDto {
	@AutoMap()
	uuid: string;

	@AutoMap()
	email: string;

	@AutoMap()
	firstName: string;

	@AutoMap()
	lastName: string;

	@AutoMap()
	isActive: boolean;

	@AutoMap()
	role: UserRole;

	@AutoMap()
	currentLessonIndex: number;

	@AutoMap()
	subscribed: boolean;

	@AutoMap()
	newsletter: boolean;

	@AutoMap()
	createdAt: Date;

	@AutoMap()
	updatedAt: Date;

	@AutoMap()
	lastConnection: Date;

	@AutoMap()
	closed: boolean;

	@AutoMap()
	closedAt: Date;
}
