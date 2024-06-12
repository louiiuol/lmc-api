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
	@PrimaryGeneratedColumn('uuid')
	uuid: string;

	@AutoMap()
	@Column()
	order: number;

	@AutoMap()
	@Column({nullable: true, default: 'black'})
	color: string;

	@AutoMap()
	@OneToMany(() => Phoneme, p => p.course, {
		cascade: ['insert', 'update', 'remove'],
		eager: true,
	})
	@JoinColumn()
	phonemes: Phoneme[];

	@AutoMap()
	@Column({nullable: true})
	script: boolean;

	@AutoMap()
	@Column({nullable: true})
	lesson?: boolean;

	@AutoMap()
	@Column({nullable: true})
	exercices?: boolean;

	@AutoMap()
	@Column({nullable: true})
	text?: boolean;

	@AutoMap()
	@Column({nullable: true})
	poster?: boolean;

	@AutoMap()
	@Column({
		type: 'simple-array',
		nullable: true,
	})
	words?: string[];

	@AutoMap()
	@Column({
		type: 'simple-array',
		nullable: true,
	})
	sounds?: string[];

	@AutoMap()
	@Column({
		type: 'simple-array',
		nullable: true,
	})
	posterNames?: string[];
}
