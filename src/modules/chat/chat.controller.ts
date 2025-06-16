import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { SendChatMessageSwaggerDto } from './dto/send-chat-message-swagger.dto';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @ApiBody({ type: SendChatMessageSwaggerDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendMessage(@Body() body: SendChatMessageDto) {
    return this.chatService.sendMessage(body);
  }

  @Get('guild')
  @ApiQuery({ name: 'guildId', type: String })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getGuildMessages(@Query('guildId') guildId: string, @Query('limit') limit?: number) {
    return this.chatService.getGuildMessages(guildId, limit);
  }

  @Get('friend')
  @ApiQuery({ name: 'friendId', type: String })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getFriendMessages(@Query('friendId') friendId: string, @Query('limit') limit?: number) {
    return this.chatService.getFriendMessages(friendId, limit);
  }
}
