import {Injectable} from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
	private s3: AWS.S3;

	constructor() {
		this.s3 = new AWS.S3({
			endpoint: 'https://s3.eu-central-003.backblazeb2.com', // Remplacez par votre région
			accessKeyId: process.env.B2_APP_KEY_ID,
			secretAccessKey: process.env.B2_APP_KEY,
			region: 'eu-central-003', // Remplacez par votre région
			s3ForcePathStyle: true, // Nécessaire pour Backblaze B2
			signatureVersion: 'v4', // Utilise la version 4 de la signature
		});
	}

	async uploadFile(
		file: Express.Multer.File,
		bucketName: string
	): Promise<string> {
		const params = {
			Bucket: bucketName,
			Key: file.originalname, // Vous pouvez personnaliser le nom du fichier ici
			Body: file.buffer,
			ContentType: file.mimetype,
		};

		const data = await this.s3.upload(params).promise();
		return data.Location; // Retourne l'URL du fichier uploadé
	}
}
