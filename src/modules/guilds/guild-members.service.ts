import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMember, GuildRole } from '../../entities/guild.entity';

@Injectable()
export class GuildMembersService {
  constructor(
    @InjectRepository(GuildMember)
    private guildMembersRepository: Repository<GuildMember>
  ) {}

  async addMember(guildId: string, userId: string, role: GuildRole = GuildRole.MEMBER) {
    const member = this.guildMembersRepository.create({ guildId, userId, role });
    return this.guildMembersRepository.save(member);
  }

  async removeMember(guildId: string, userId: string) {
    await this.guildMembersRepository.delete({ guildId, userId });
  }

  async updateRole(guildId: string, userId: string, role: GuildRole) {
    const member = await this.guildMembersRepository.findOne({ where: { guildId, userId } });
    if (!member) throw new NotFoundException('Member not found');
    member.role = role;
    return this.guildMembersRepository.save(member);
  }

  async listMembers(guildId: string) {
    return this.guildMembersRepository.find({ where: { guildId } });
  }
}
