import {Type} from '@nestjs/common';

export type DocParameters = {
	path: string;
	description?: string;
	success?: string;
	error?: string;
	returnType?: Type<unknown>;
	guards?: any[];
	level?: 'public' | 'user' | 'admin';
	body?: true;
};
