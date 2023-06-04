import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, Repository} from 'typeorm';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {UserCreateDto} from './types/dtos/user-create.dto';
import {UserViewDto} from './types/dtos/user-view.dto';
import {User} from './types/user.entity';
import {environment} from '../environment';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	private readonly salt = Number(environment.SALT);
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectMapper() private readonly classMapper: Mapper
	) {}

	/**
	 * Store User entity in database.
	 * @param user entity to be saved
	 */
	async save(user: UserCreateDto): Promise<UserViewDto> {
		user.password = await bcrypt.hash(user.password, this.salt);
		const entity = await this.usersRepository.save(user);
		return this.classMapper.mapAsync(entity, User, UserViewDto);
	}

	findAll = (): Promise<User[]> => this.usersRepository.find();

	findOneByUuid = (uuid: number): Promise<User> =>
		this.usersRepository.findOneBy({uuid});

	findOneByEmail = (email: string): Promise<User> =>
		this.usersRepository.findOne({
			where: {email},
		});

	remove = async (id: string): Promise<DeleteResult> =>
		await this.usersRepository.delete(id);

	nextLesson = async (user: User): Promise<number> => {
		const entity = await this.findOneByUuid(user.uuid);
		entity.currentLessonIndex++;
		return (await this.usersRepository.save(entity)).currentLessonIndex;
	};
}
