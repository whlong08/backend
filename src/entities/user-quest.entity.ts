import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserQuestStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

@Entity('user_quests')
export class UserQuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'quest_id', type: 'uuid' })
  questId: string;

  @Column({
    type: 'enum',
    enum: UserQuestStatus,
    default: UserQuestStatus.NOT_STARTED,
  })
  status: UserQuestStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({
    name: 'started_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startedAt?: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt?: Date;

  @Column({ name: 'submission_data', type: 'jsonb', nullable: true })
  submissionData?: Record<string, any>;

  @Column({ name: 'earned_points', type: 'int', default: 0 })
  earnedPoints: number;

  @Column({ name: 'earned_experience', type: 'int', default: 0 })
  earnedExperience: number;

  @Column({ name: 'earned_badges', type: 'text', array: true, nullable: true })
  earnedBadges?: string[];
}
