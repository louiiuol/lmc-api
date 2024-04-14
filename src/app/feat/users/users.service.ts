import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User, UserCreateDto, UserViewDto} from './types';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		@InjectMapper() private readonly classMapper: Mapper
	) {}

	/**
	 * Stores User entity in database.
	 * @param user entity to be saved
	 */
	save = async (user: UserCreateDto) => await this.usersRepository.save(user);

	/**
	 * Retrieves all users from database in simple array.
	 * @returns Array of all users in database
	 */
	findAll = async () =>
		this.classMapper.mapArray(
			await this.usersRepository.find(),
			User,
			UserViewDto
		);

	/**
	 * Retrieves a single user based on their uuid.
	 * @param uuid identifier to be checked
	 * @returns User matching given uuid, if they exists.
	 */
	findOneByUuid = async (uuid: string) =>
		await this.usersRepository.findOne({where: {uuid}});

	/**
	 * Retrieves a single user based on their email.
	 * @param email identifier to be checked
	 * @returns User matching given email, if they exists.
	 */
	findOneByEmail = async (email: string) =>
		await this.usersRepository.findOne({
			where: {email},
		});

	update = async (uuid: string, dto: Partial<User>) => {
		dto.updatedAt = new Date();
		return await this.usersRepository.save({
			...(await this.findOneByUuid(uuid)),
			...dto,
		});
	};

	/**
	 * Removes user matching given uuid from database.
	 * @param uuid user identifier
	 * @returns DeleteResult (showing if deletion was successful)
	 */
	remove = async (uuid: string) => await this.usersRepository.delete(uuid);
}
