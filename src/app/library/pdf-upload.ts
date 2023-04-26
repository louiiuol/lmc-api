import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {v4 as uuidv4} from 'uuid';

export const pdfUploader = FileInterceptor('file', {
	storage: diskStorage({
		destination: './uploads',
		filename: (req, file, callback) => {
			callback(null, `${uuidv4()}-${file.originalname}`);
		},
	}),
	fileFilter: (req, file, callback) => {
		if (file.mimetype !== 'application/pdf') {
			return callback(new Error('Only PDF files are allowed'), false);
		}
		callback(null, true);
	},
});
