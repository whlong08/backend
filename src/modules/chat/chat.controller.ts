import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatType } from '../../entities/chat-message.entity';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendMessage(@Body() body: SendChatMessageDto) {
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
