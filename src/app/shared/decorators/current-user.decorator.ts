import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {UserAuth} from '@feat/users/types';

export const CurrentUser = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const user = ctx.switchToHttp().getRequest().user as UserAuth;
		if (!user) return null;
		return (data ? user[data] : user) as UserAuth; // extract a specific property only if specified or get a user object
	}
);
