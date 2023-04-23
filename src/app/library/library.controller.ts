import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PhonemeCreateDto } from './types';
import { LibraryService } from './library.service';
import { pdfUploader } from './pdf-upload';

@Controller()
export class LibraryController {
  constructor(private libraryService: LibraryService) {}

  @Post('phonemes')
  @UseInterceptors(pdfUploader)
  async createPhoneme(
    @Body() body: PhonemeCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.libraryService.createPhoneme(body.name, file.path);
  }

  @Post('lessons')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'script', maxCount: 1 },
      { name: 'exercices', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
    ]),
  )
  uploadFile(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    console.log(files);
  }
}
