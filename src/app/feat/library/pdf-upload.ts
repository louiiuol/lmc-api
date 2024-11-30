import {FileFieldsInterceptor} from '@nestjs/platform-express';
import {MulterField} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const PdfUploader = (files: MulterField[]) =>
	FileFieldsInterceptor(files, {
		// storage: diskStorage({
		// 	destination: './uploads',
		// 	filename: (req, file, callback) => {
		// 		callback(null, `${uuidv4()}-${file.originalname}`);
		// 	},
		// }),
		fileFilter: (req, file, callback) => {
			if (file.mimetype !== 'application/pdf') {
				return callback(new Error('Only PDF files are allowed'), false);
			}
			callback(null, true);
		},
	});
