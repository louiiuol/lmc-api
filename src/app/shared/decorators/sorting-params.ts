import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
	Logger,
} from '@nestjs/common';
import {ApiProperty} from '@nestjs/swagger';
import {Request} from 'express';
import {DECORATORS} from '@nestjs/swagger/dist/constants';
export class Sorting {
	@ApiProperty({description: 'Propriété du tri actif.'})
	property: string;
	@ApiProperty({description: 'Direction du tri actif.'})
	direction: string;
}

const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;

export const SortingParams = createParamDecorator(
	(validParams, ctx: ExecutionContext): Sorting => {
		const req: Request = ctx.switchToHttp().getRequest();
		const sort = req.query.sort as string;
		if (!sort) return null;

		// check if the valid params sent is an array
		if (typeof validParams != 'object')
			throw new BadRequestException('Invalid sort parameter');

		// check the format of the sort query param

		if (!RegExp(sortPattern).exec(sort))
			throw new BadRequestException('Invalid sort parameter');

		// extract the property name and direction and check if they are valid
		const [property, direction] = sort.split(':');
		if (!validParams.includes(property))
			throw new BadRequestException(`Invalid sort property: ${property}`);

		return {property, direction};
	},
	[
		(target, key, index) => {
			// Here we will define query parameter for swagger documentation
			const explicit =
				Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[key]) ?? [];
			Reflect.defineMetadata(
				DECORATORS.API_PARAMETERS,
				[
					...explicit,
					{
						description:
							'Propriété sur laquelle appliqué le filtre. Pour vérifier les champs disponibles, référez vous aux propriétés des items renvoyés.',
						in: 'query',
						name: 'sort',
						example: 'property:direction',
						required: false,
						type: 'string',
					},
				],
				target[key]
			);
		},
	]
);
