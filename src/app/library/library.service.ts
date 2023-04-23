import { Injectable } from '@nestjs/common';
import { Phoneme } from './types';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(Phoneme) private phonemeRepository: Repository<Phoneme>,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {}

  async createPhoneme(name: string, poster: string): Promise<string> {
    return (await this.phonemeRepository.save({ name, poster })).uuid;
  }
}
