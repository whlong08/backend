import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
  ) {}

  async create(data: Partial<Quest>): Promise<Quest> {
    const questData = {
      title: data.title,
      description: data.description,
      type: data.type,
      difficulty: data.difficulty,
      category: data.category,
      rewardPoints: data.rewardPoints ?? 0,
      rewardExperience: data.rewardExperience ?? 0,
      rewardBadges: data.rewardBadges ?? [],
      requirements: data.requirements ?? {},
      creatorId: data.creatorId,
      isPublic: data.isPublic ?? true,
      isActive: data.isActive ?? true,
    };

    console.log('Quest data before save:', questData);
    const quest = this.questsRepository.create(questData);
    return this.questsRepository.save(quest);
  }

  async findAll(): Promise<Quest[]> {
    return this.questsRepository.find();
  }

  async findAllWithPrivate(userId: string): Promise<Quest[]> {
    // Trả về quest public hoặc quest private của user
    return this.questsRepository.find({
      where: [{ isPublic: true }, { isPublic: false, creatorId: userId }],
    });
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
