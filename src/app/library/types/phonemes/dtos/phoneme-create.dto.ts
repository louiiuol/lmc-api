import { IsNotEmpty } from 'class-validator';

export class PhonemeCreateDto {
  @IsNotEmpty()
  name: string;
}
