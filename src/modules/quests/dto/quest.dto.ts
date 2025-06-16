import { ApiProperty } from '@nestjs/swagger';
import { QuestType, QuestDifficulty, QuestCategory } from '../../../entities/quest.entity';

export class CreateQuestDto {
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: QuestType }) type: QuestType;
  @ApiProperty({ enum: QuestDifficulty }) difficulty: QuestDifficulty;
  @ApiProperty({ enum: QuestCategory }) category: QuestCategory;
  @ApiProperty() rewardPoints: number;
  @ApiProperty() rewardExperience: number;
  @ApiProperty({ type: [String], required: false }) rewardBadges?: string[];
  @ApiProperty({ type: Object, required: false }) requirements?: Record<string, any>;
  @ApiProperty({ required: false }) isPublic?: boolean;
  @ApiProperty({ required: false }) isActive?: boolean;
}

export class UpdateQuestDto {
  @ApiProperty({ required: false }) title?: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ enum: QuestType, required: false }) type?: QuestType;
  @ApiProperty({ enum: QuestDifficulty, required: false }) difficulty?: QuestDifficulty;
  @ApiProperty({ enum: QuestCategory, required: false }) category?: QuestCategory;
  @ApiProperty({ required: false }) rewardPoints?: number;
  @ApiProperty({ required: false }) rewardExperience?: number;
  @ApiProperty({ type: [String], required: false }) rewardBadges?: string[];
  @ApiProperty({ type: Object, required: false }) requirements?: Record<string, any>;
  @ApiProperty({ required: false }) isPublic?: boolean;
  @ApiProperty({ required: false }) isActive?: boolean;
}
