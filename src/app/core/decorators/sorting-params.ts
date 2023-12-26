import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
} from '@nestjs/common';
import {Request} from 'express';

export interface Sorting {
	property: string;
	direction: string;
}

export const SortingParams = createParamDecorator(
	(validParams, ctx: ExecutionContext): Sorting => {
		const req: Request = ctx.switchToHttp().getRequest();
		const sort = req.query.sort as string;
		if (!sort) return null;

		// check if the valid params sent is an array
		if (typeof validParams != 'object')
			throw new BadRequestException('Invalid sort parameter');

		// check the format of the sort query param
		const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;
		if (!sort.match(sortPattern))
			throw new BadRequestException('Invalid sort parameter');

		// extract the property name and direction and check if they are valid
		const [property, direction] = sort.split(':');
		if (!validParams.includes(property))
			throw new BadRequestException(`Invalid sort property: ${property}`);

		return {property, direction};
	}
);
