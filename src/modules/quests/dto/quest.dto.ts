import { ApiProperty } from '@nestjs/swagger';
import {
  QuestType,
  QuestDifficulty,
  QuestCategory,
} from '../../../entities/quest.entity';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class CreateQuestDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: QuestType })
  @IsEnum(QuestType)
  type: QuestType;

  @ApiProperty({ enum: QuestDifficulty })
  @IsEnum(QuestDifficulty)
  difficulty: QuestDifficulty;

  @ApiProperty({ enum: QuestCategory })
  @IsEnum(QuestCategory)
  category: QuestCategory;

  @ApiProperty()
  @IsInt()
  rewardPoints: number;

  @ApiProperty()
  @IsInt()
  rewardExperience: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  rewardBadges?: string[];

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  requirements?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateQuestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: QuestType, required: false })
  @IsEnum(QuestType)
  @IsOptional()
  type?: QuestType;

  @ApiProperty({ enum: QuestDifficulty, required: false })
  @IsEnum(QuestDifficulty)
  @IsOptional()
  difficulty?: QuestDifficulty;

  @ApiProperty({ enum: QuestCategory, required: false })
  @IsEnum(QuestCategory)
  @IsOptional()
  category?: QuestCategory;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  rewardPoints?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  rewardExperience?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  rewardBadges?: string[];

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  requirements?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
