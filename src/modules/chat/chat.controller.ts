import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatType } from '../../entities/chat-message.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(@Body() body: any) {
    // TODO: validate body
    return this.chatService.sendMessage(body);
  }

  @Get('guild')
  async getGuildMessages(@Query('guildId') guildId: string, @Query('limit') limit?: number) {
    return this.chatService.getGuildMessages(guildId, limit);
  }

  @Get('friend')
  async getFriendMessages(@Query('friendId') friendId: string, @Query('limit') limit?: number) {
    return this.chatService.getFriendMessages(friendId, limit);
  }
}
