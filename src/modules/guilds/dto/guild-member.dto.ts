import { ApiProperty } from '@nestjs/swagger';
import { GuildRole } from '../../../entities/guild.entity';

export class AddGuildMemberDto {
  @ApiProperty() userId: string;
  @ApiProperty({ enum: GuildRole, required: false }) role?: GuildRole;
}

export class UpdateGuildMemberRoleDto {
  @ApiProperty({ enum: GuildRole }) role: GuildRole;
}
