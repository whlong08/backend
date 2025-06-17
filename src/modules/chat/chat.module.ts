import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../../entities/chat-message.entity';
import { GuildMember } from '../../entities/guild.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { GuildsModule } from '../guilds/guilds.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, GuildMember]), GuildsModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
