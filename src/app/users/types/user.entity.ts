import {AutoMap} from '@automapper/classes';
import {Entity, Column, PrimaryGeneratedColumn, BaseEntity} from 'typeorm';
import {UserRole} from './user.role';

/**
 ** Entity representing 'users' Table in database
 */
@Entity({
	name: 'users',
})
export class User extends BaseEntity {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid!: string;

	@AutoMap()
	@Column({
		nullable: true,
	})
	firstName?: string;

	@AutoMap()
	@Column({
		nullable: true,
	})
	lastName?: string;

	@AutoMap()
	@Column({
		unique: true,
	})
	email: string;

	@Column()
	password: string;

	@AutoMap()
	@Column({default: false})
	isActive: boolean;

	@AutoMap()
	@Column({default: false})
	subscribed: boolean;

	@AutoMap()
	@Column({default: 0})
	currentLessonIndex: number;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@Column({default: () => 'NOW()'})
	createdAt: Date;

	@Column({default: () => 'NOW()'})
	updatedAt: Date;
}
