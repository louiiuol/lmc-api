import {Injectable, Logger} from '@nestjs/common';
import {capitalize} from '@shared/helpers';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ZipService {
	async zipDirectory(source: string, out: string): Promise<void> {
		const archive = archiver('zip', {
			zlib: {level: 9}, // Sets the compression level.
		});
		const stream = fs.createWriteStream(out);

		return new Promise((resolve, reject) => {
			stream.on('close', resolve);
			archive.on('error', reject);

			archive.pipe(stream);

			try {
				// Ajouter tous les fichiers dans le dossier
				fs.readdir(source, (err, files) => {
					if (err) {
						reject(err);
					} else {
						files.forEach(file => {
							const filePath = path.join(source, file);
							const fileStats = fs.statSync(filePath);
							if (fileStats.isFile()) {
								archive.file(filePath, {name: this.translateFileName(file)});
							} else if (fileStats.isDirectory()) {
								archive.directory(filePath, file);
							}
						});

						archive.finalize();
					}
				});
			} catch (e) {
				Logger.error(e);
			}
		});
	}

	private translateFileName(fileName: string) {
		return capitalize(
			fileName
				.replace('poster-sound', 'Son')
				.replace('poster', 'affiche')
				.replace('-', ' ')
				.replace('lesson', 'leçon')
		);
	}
}
