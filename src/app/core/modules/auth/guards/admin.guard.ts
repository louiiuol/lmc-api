import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		return req.user.role === 'ADMIN';
	}
}
