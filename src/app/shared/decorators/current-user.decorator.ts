import {UserAuth} from '@feat/users/types';
import {
	createParamDecorator,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const user = ctx.switchToHttp().getRequest().user as UserAuth;
		if (!user) return new UnauthorizedException('Token invalide');
		return (data ? user[data] : user) as UserAuth; // extract a specific property only if specified or get a user object
	}
);
