import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
} from '@nestjs/common';
import {Request} from 'express';

export interface Filtering {
	property: string;
	rule: string;
	value: string;
}

// valid filter rules
export enum FilterRule {
	EQUALS = 'eq',
	NOT_EQUALS = 'neq',
	GREATER_THAN = 'gt',
	GREATER_THAN_OR_EQUALS = 'gte',
	LESS_THAN = 'lt',
	LESS_THAN_OR_EQUALS = 'lte',
	LIKE = 'like',
	NOT_LIKE = 'nlike',
	IN = 'in',
	NOT_IN = 'nin',
	IS_NULL = 'isnull',
	IS_NOT_NULL = 'isnotnull',
}

export const FilteringParams = createParamDecorator(
	(data, ctx: ExecutionContext): Filtering[] => {
		const req: Request = ctx.switchToHttp().getRequest();
		const filter = req.query.filter as string;

		if (!filter) return null;

		// check if the valid params sent is an array
		if (typeof data != 'object')
			throw new BadRequestException('Invalid filter parameter');

		return filter.split('&').map(f => {
			// validate the format of the filter, if the rule is 'isnull' or 'isnotnull' it don't need to have a value
			if (
				!RegExp(
					/^\w+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9_,]+$/
				).exec(f) &&
				!RegExp(/^\w+:(isnull|isnotnull)$/).exec(f)
			) {
				throw new BadRequestException('Invalid filter parameter', f);
			}

			// extract the parameters and validate if the rule and the property are valid
			const [property, rule, value] = f.split(':');
			if (!data.includes(property))
				throw new BadRequestException(`Invalid filter property: ${property}`);
			if (!Object.values(FilterRule).includes(rule as FilterRule))
				throw new BadRequestException(`Invalid filter rule: ${rule}`);

			return {property, rule, value};
		});
	}
);
