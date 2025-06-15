import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ONE_TIME = 'one_time',
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum QuestCategory {
  STUDY = 'study',
  SKILL = 'skill',
  PROJECT = 'project',
  CHALLENGE = 'challenge',
  COMMUNITY = 'community',
}

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: QuestType })
  type: QuestType;

  @Column({ type: 'enum', enum: QuestDifficulty })
  difficulty: QuestDifficulty;

  @Column({ type: 'enum', enum: QuestCategory })
  category: QuestCategory;

  @Column({ name: 'reward_points', type: 'int', default: 0 })
  rewardPoints: number;

  @Column({ name: 'reward_experience', type: 'int', default: 0 })
  rewardExperience: number;

  @Column({ name: 'reward_badges', type: 'text', array: true, nullable: true })
  rewardBadges: string[];

  @Column({ type: 'jsonb', default: {} })
  requirements: Record<string, any>;

  @Column({ name: 'creator_id', type: 'uuid', nullable: true })
  creatorId: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
