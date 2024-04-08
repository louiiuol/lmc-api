import {AutomapperProfile, InjectMapper} from '@automapper/nestjs';
import {createMap, Mapper} from '@automapper/core';
import {Injectable} from '@nestjs/common';
import {UserViewDto, User} from './types';

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
