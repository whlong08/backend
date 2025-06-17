import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild, GuildMember, GuildRole } from '../../entities/guild.entity';

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(Guild)
    private guildsRepository: Repository<Guild>,
    @InjectRepository(GuildMember)
    private guildMembersRepository: Repository<GuildMember>,
  ) {}

  async create(data: Partial<Guild>): Promise<Guild> {
    const guild = this.guildsRepository.create(data);
    const saved = await this.guildsRepository.save(guild);
    if (saved.ownerId) {
      // Tự động thêm owner vào guild_members
      const member = this.guildMembersRepository.create({
        guildId: saved.id,
        userId: saved.ownerId,
        role: GuildRole.OWNER,
      });
      await this.guildMembersRepository.save(member);
    }
    return saved;
  }

  async findAll(): Promise<Guild[]> {
    return this.guildsRepository.find();
  }

  async findOne(id: string): Promise<Guild> {
    const guild = await this.guildsRepository.findOne({ where: { id } });
    if (!guild) throw new NotFoundException('Guild not found');
    return guild;
  }

  async findByIds(ids: string[]): Promise<Guild[]> {
    if (!ids.length) return [];
    return this.guildsRepository.findByIds(ids);
  }

  async update(id: string, data: Partial<Guild>): Promise<Guild> {
    await this.guildsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.guildsRepository.delete(id);
  }
}
