import {createMap, Mapper} from '@automapper/core';
import {AutomapperProfile, InjectMapper} from '@automapper/nestjs';
import {Injectable} from '@nestjs/common';
import {User, UserViewDto} from './types';

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
