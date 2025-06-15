import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NotificationType {
  SYSTEM = 'system',
  FRIEND_REQUEST = 'friend_request',
  QUEST_COMPLETED = 'quest_completed',
  GUILD_INVITE = 'guild_invite',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT = 'achievement',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
