import {Type} from '@nestjs/common';
import {AppGuardsLevels} from '@shared/decorators/rest/resource.decorator';

export type DocParameters = {
	path?: string;
	description?: string;
	code?: number;
	success?: string;
	error?: string;
	returnType?: Type<unknown>;
	restriction?: AppGuardsLevels;
	body?: Type<unknown>;
	array?: true;
	noContent?: true;
	withPagination?: true;
};
