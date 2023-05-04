import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, Repository} from 'typeorm';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {User, UserCreateDto, UserViewDto} from './types';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectMapper() private readonly classMapper: Mapper
	) {}

	async save(user: UserCreateDto): Promise<UserViewDto> {
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
