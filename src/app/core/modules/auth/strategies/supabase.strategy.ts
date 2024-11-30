import {Request} from 'express';
import {JwtFromRequestFunction} from 'passport-jwt';
import {Strategy} from 'passport-strategy';

import {createClient, SupabaseClient} from '@supabase/supabase-js';

import {AuthUser as SupabaseAuthUser} from '@supabase/supabase-js';

import {ExtractJwt} from 'passport-jwt';

import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';

const UNAUTHORIZED = 'Unauthorized';
const SUPABASE_AUTH = 'SUPABASE_AUTH';

export class SupabaseAuthStrategy extends Strategy {
	readonly name = SUPABASE_AUTH;
	private supabase: SupabaseClient;
	private extractor: JwtFromRequestFunction;
	success: (user: any, info: any) => void;
	fail: Strategy['fail'];

	constructor() {
		const options = {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
			supabaseOptions: {},
			supabaseJwtSecret: process.env.JWT_SECRET,
			extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
		};
		super();
		if (!options.extractor) {
			throw new Error(
				'\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
			);
		}

		this.supabase = createClient(
			options.supabaseUrl,
			options.supabaseKey,
			(options.supabaseOptions = {})
		);
		this.extractor = options.extractor;
	}

	async validate(payload: SupabaseAuthUser): Promise<SupabaseAuthUser | null> {
		if (payload) {
			this.success(payload, {});

			return payload;
		}

		this.fail(UNAUTHORIZED, 401);

		return null;
	}

	authenticate(req: Request): void {
		const idToken = this.extractor(req);

		if (!idToken) {
			this.fail(UNAUTHORIZED, 401);
			return;
		}

		this.supabase.auth
			.getUser(idToken)
			.then(({data: {user}}) => this.validate(user))
			.catch(err => {
				this.fail(err.message, 401);
			});
	}
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
	SupabaseAuthStrategy,
	'supabase'
) {
	public constructor() {
		super();
	}

	async validate(payload: any): Promise<any> {
		super.validate(payload);
	}

	authenticate(req) {
		super.authenticate(req);
	}
}
