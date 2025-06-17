import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GuildRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner',
}

@Entity('guilds')
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number;

  @Column({ name: 'member_count', type: 'int', default: 0 })
  memberCount: number;

  @Column({ name: 'max_members', type: 'int', default: 50 })
  maxMembers: number;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('guild_members')
export class GuildMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guild_id', type: 'uuid' })
  guildId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: GuildRole, default: GuildRole.MEMBER })
  role: GuildRole;

  @Column({ name: 'points_contributed', type: 'int', default: 0 })
  pointsContributed: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
