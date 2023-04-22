import { AutoMap } from '@automapper/classes';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { UserRole } from './user.role';

/**
 ** Entity representing 'users' Table in database
 */
@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid!: number;

  @AutoMap()
  @Column({
    nullable: true,
  })
  firstName!: string;

  @AutoMap()
  @Column({
    nullable: true,
  })
  lastName!: string;

  @AutoMap()
  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;
}
