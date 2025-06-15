import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatType } from '../../entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,
  ) {}

  async sendMessage(data: Partial<ChatMessage>): Promise<ChatMessage> {
    const message = this.chatRepository.create(data);
    return this.chatRepository.save(message);
  }

  async getGuildMessages(guildId: string, limit = 50): Promise<ChatMessage[]> {
    return this.chatRepository.find({
      where: { guildId, type: ChatType.GUILD },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFriendMessages(friendId: string, limit = 50): Promise<ChatMessage[]> {
    return this.chatRepository.find({
      where: { friendId, type: ChatType.FRIEND },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
