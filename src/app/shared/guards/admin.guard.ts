import {UsersService} from '@feat/users/users.service';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(private readonly userService: UsersService) {}
	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const {role} = await this.userService.findOneByEmail(req.user.email);
		return role === 'ADMIN';
	}
}
