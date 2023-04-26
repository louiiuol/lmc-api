import {AutoMap} from '@automapper/classes';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import {Phoneme} from '../phonemes';

/**
 ** Collection of phonemes, posters and exercises meant to be discover in a week.
 */
@Entity({
	name: 'courses',
})
export class Course extends BaseEntity {
	@AutoMap()
	@PrimaryGeneratedColumn()
	uuid: string;

	@Column()
	name: string;

	@AutoMap()
	@OneToMany(() => Phoneme, p => p.course)
	@JoinColumn()
	phonemes: Phoneme[];

	@AutoMap()
	@Column()
	script: string;

	@AutoMap()
	@Column()
	lesson: string;

	@AutoMap()
	@Column()
	exercice: string;

	@AutoMap()
	@Column({nullable: true})
	text?: string;

	@AutoMap()
	@Column({nullable: true})
	poster?: string;
}
