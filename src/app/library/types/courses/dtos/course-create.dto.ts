import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsFile } from '../../decorators/is-file.validator';

export class CourseCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsArray()
  phonemes: string[];

  @IsNotEmpty()
  @IsFile({ mime: ['application/pdf'] })
  script: unknown;

  @IsFile({ mime: ['application/pdf'] })
  poster?: unknown;

  @IsFile({ mime: ['application/pdf'] })
  lesson?: unknown;

  @IsFile({ mime: ['application/pdf'] })
  exercice?: unknown;
}
