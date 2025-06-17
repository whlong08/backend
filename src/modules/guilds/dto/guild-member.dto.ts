import { ApiProperty } from '@nestjs/swagger';
import { GuildRole } from '../../../entities/guild.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddGuildMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
  
  @ApiProperty({ enum: GuildRole, required: false })
  @IsEnum(GuildRole)
  @IsOptional()
  role?: GuildRole;
}

export class UpdateGuildMemberRoleDto {
  @ApiProperty({ enum: GuildRole })
  @IsEnum(GuildRole)
  @IsNotEmpty()
  role: GuildRole;
}
