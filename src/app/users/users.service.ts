import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User, UserCreateDto, UserRole, UserViewDto} from './types';
import {Filtering} from '../core/decorators/filtering-params';
import {Pagination} from '../core/decorators/pagination-params';
import {Sorting} from '../core/decorators/sorting-params';
import {getWhere, getOrder} from '../core/helpers/type-orm-helpers.fn';
import {PaginatedResource} from '../core/types/paginated-resource';
import {Mapper} from '@automapper/core';
import {InjectMapper} from '@automapper/nestjs';
import {filter} from 'rxjs';

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
	 * Retrieves users form database based on given criteria.
	 * @param pagination sets limit, size, page size and offset of the page
	 * @param sort Property and direction to apply to the pagination
	 * @param filter property with rule (eq, lgt ...) and value to apply to the pagination
	 * @returns List of users with pagination configuration
	 */
	findAllPaginated = async (
		{page, limit, size, offset}: Pagination,
		sort?: Sorting,
		filters?: Filtering | Filtering[]
	): Promise<PaginatedResource<UserViewDto>> => {
		if (!Array.isArray(filters)) filters = [filters];
		const wheres = filters
			.map(f => getWhere(f))
			.reduce((prev, curr) => ({...prev, ...curr}), {});
		const [users, total] = await this.usersRepository.findAndCount({
			order: getOrder(sort),
			where: {
				...wheres,
				role: UserRole.USER,
			},
			take: limit,
			skip: offset,
		});

		return {
			totalItems: total,
			items: this.classMapper.mapArray(users, User, UserViewDto),
			page,
			size,
		};
	};

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
