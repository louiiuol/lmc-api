import {Type} from '@nestjs/common';

export type DocParameters = {
	path?: string;
	description?: string;
	code?: number;
	success?: string;
	error?: string;
	returnType?: Type<unknown>;
	restriction?: 'user' | 'admin' | 'refresh' | 'local';
	body?: Type<unknown>;
	array?: true;
	noContent?: true;
	withPagination?: true;
};
