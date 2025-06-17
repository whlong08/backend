import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ChatType {
  GUILD = 'GUILD',
  FRIEND = 'FRIEND',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @Column({ nullable: true })
  guildId?: string;

  @Column({ nullable: true })
  friendId?: string;

  @Column()
  senderId: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  // ...có thể bổ sung trường như isRead, attachments, v.v.
}
