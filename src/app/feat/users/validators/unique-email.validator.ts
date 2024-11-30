import {UsersService} from '@feat/users/users.service';
import {
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from '@nestjs/class-validator';
import {Injectable} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';

/**
 * Checks if user registering has unique email
 */
@ValidatorConstraint({async: true})
@Injectable()
export class IsUserAlreadyExistConstraint
	implements ValidatorConstraintInterface
{
	constructor(private moduleRef: ModuleRef) {}

	validate = (email: string) =>
		this.moduleRef
			.get(UsersService)
			.findOneByEmail(email)
			.then(exist => !exist);

	defaultMessage = () => 'UNIQUE_EMAIL';
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsUserAlreadyExistConstraint,
		});
	};
}
