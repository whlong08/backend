import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Quest } from './src/entities/quest.entity';
import { UserQuest } from './src/entities/user-quest.entity';
import { Guild } from './src/entities/guild.entity';
import { GuildMember } from './src/entities/guild.entity';
import { Friendship } from './src/entities/friendship.entity';
import { AiChatSession } from './src/entities/ai-chat.entity';
import { AiChatMessage } from './src/entities/ai-chat.entity';
import { Notification } from './src/entities/notification.entity';
import { ChatMessage } from './src/entities/chat-message.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Quest,
    UserQuest,
    Guild,
    GuildMember,
    Friendship,
    AiChatSession,
    AiChatMessage,
    Notification,
    ChatMessage,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
