import {
	createParamDecorator,
	ExecutionContext,
	BadRequestException,
} from '@nestjs/common';

export const QueryRequired = createParamDecorator(
	(key: string, ctx: ExecutionContext) => {
		const value = ctx.switchToHttp().getRequest().query[key];

		if (!value && value !== 0) {
			throw new BadRequestException(`Missing required query param: '${key}'`);
		}

		return value;
	}
);
