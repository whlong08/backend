import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>
  ) {}

  async create(data: Partial<Quest>): Promise<Quest> {
    const quest = this.questsRepository.create(data);
    return this.questsRepository.save(quest);
  }

  async findAll(): Promise<Quest[]> {
    return this.questsRepository.find();
  }

  async findOne(id: string): Promise<Quest> {
    const quest = await this.questsRepository.findOne({ where: { id } });
    if (!quest) throw new NotFoundException('Quest not found');
    return quest;
  }

  async update(id: string, data: Partial<Quest>): Promise<Quest> {
    await this.questsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.questsRepository.delete(id);
  }
}
