import {AutoMap} from '@automapper/classes';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import {Course} from '../courses/course.entity';

@Entity({
	name: 'phonemes',
})
export class Phoneme extends BaseEntity {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid: string;

	@AutoMap()
	@Column()
	name: string;

	@AutoMap()
	@ManyToOne(() => Course, c => c.phonemes)
	course: Course;

	@AutoMap()
	@Column({nullable: true})
	poster?: boolean;

	@AutoMap()
	@Column({
		type: 'simple-array',
		nullable: true,
	})
	posterNames?: string[];

	@AutoMap()
	@Column({nullable: true})
	endOfWord?: boolean;

	@AutoMap()
	@Column({
		type: 'simple-array',
		nullable: true,
	})
	sounds?: string[];

	@AutoMap()
	@Column({nullable: true})
	info?: string;
}
