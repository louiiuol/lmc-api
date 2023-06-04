/* istanbul ignore file */
import {AutomapperProfile, InjectMapper} from '@automapper/nestjs';
import {createMap, Mapper} from '@automapper/core';
import {Injectable} from '@nestjs/common';
import {UserViewDto} from './types/dtos/user-view.dto';
import {User} from './types/user.entity';

@Injectable()
export class UserProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper) => {
			createMap(mapper, User, UserViewDto);
		};
	}
}
