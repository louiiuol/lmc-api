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
}
