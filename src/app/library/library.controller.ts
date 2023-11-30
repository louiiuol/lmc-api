import {
	Controller,
	Get,
	Header,
	Param,
	Post,
	Req,
	StreamableFile,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';

import {LibraryService} from './library.service';
import {JwtAuthGuard} from '../auth/guards/jwt/jwt-auth.guard';
import {AdminGuard} from '../auth/guards/roles/admin.guard';
import {createReadStream} from 'fs';
import {join} from 'path';
import {UsersService} from '../users/users.service';

@Controller()
export class LibraryController {
	constructor(
		private libraryService: LibraryService,
		private usersService: UsersService
	) {}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Post('courses')
	async generateLibrary() {
		await this.libraryService.createLibrary();
		return {
			code: 201,
			data: null,
			message: '🎉 Library successfully generated!',
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses')
	async getAllCourses() {
		return await this.libraryService.getAllCourses();
	}

	@UseGuards(JwtAuthGuard)
	@Get('courses/:index/:fileName')
	@Header('Content-type', 'application/pdf')
	async getFile(
		@Param() p: {index: number; fileName: string},
		@Req() request
	): Promise<StreamableFile> {
		if (
			p.index <= 3 ||
			(await this.usersService.findOneByEmail(request.user?.email)).subscribed
		) {
			const filePath = `library/${p.index}/${p.fileName}.pdf`;
			return new StreamableFile(
				createReadStream(join(process.cwd(), filePath))
			);
		} else throw new UnauthorizedException('FOR_SUB_ONLY');
	}
}
