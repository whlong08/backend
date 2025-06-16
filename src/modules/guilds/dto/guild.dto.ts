import { ApiProperty } from '@nestjs/swagger';

export class CreateGuildDto {
  @ApiProperty() name: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false }) maxMembers?: number;
  @ApiProperty({ required: false }) isPublic?: boolean;
}

export class UpdateGuildDto {
  @ApiProperty({ required: false }) name?: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false }) maxMembers?: number;
  @ApiProperty({ required: false }) isPublic?: boolean;
}
