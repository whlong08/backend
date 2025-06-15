import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { User } from '../entities/user.entity';
import { Quest } from '../entities/quest.entity';
import { UserQuest } from '../entities/user-quest.entity';
import { Guild, GuildMember } from '../entities/guild.entity';
import { Friendship } from '../entities/friendship.entity';
import { AiChatSession, AiChatMessage } from '../entities/ai-chat.entity';
import { Notification } from '../entities/notification.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
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
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) throw new Error('REDIS_URL is not defined');
        return new Redis(redisUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class DatabaseModule {}
