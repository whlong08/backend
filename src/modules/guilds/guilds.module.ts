import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild, GuildMember } from '../../entities/guild.entity';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { GuildMembersService } from './guild-members.service';
import { GuildMembersController } from './guild-members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, GuildMember])],
  providers: [GuildsService, GuildMembersService],
  controllers: [GuildsController, GuildMembersController],
  exports: [GuildsService, GuildMembersService],
})
export class GuildsModule {}
