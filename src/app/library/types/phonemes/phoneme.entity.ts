import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
// TODO Add unique phoneme validator
@Entity({
  name: 'phonemes',
})
export class Phoneme extends BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  uuid: string;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column()
  poster: string;

  @AutoMap()
  @ManyToOne(() => Course, (w) => w.phonemes)
  course: Course;
}
