import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({
	name: 'news',
})
export class Newsletter extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	uuid: string;

	@Column()
	subject: string;

	@Column()
	intro: string;

	@Column()
	content: string;

	@Column({nullable: true, default: () => 'CURRENT_TIMESTAMP'})
	date: Date;
}
