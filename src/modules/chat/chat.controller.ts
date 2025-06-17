import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { ChatType } from '../../entities/chat-message.entity';
import { AuthenticatedUser } from '../../common/types/auth.types';

interface SendMessageDto {
  content: string;
  type: ChatType;
  guildId?: string;
  friendId?: string;
}

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        type: { type: 'string', enum: ['GUILD', 'FRIEND'] },
        guildId: { type: 'string' },
        friendId: { type: 'string' },
      },
      required: ['content', 'type'],
    },
  })
  async sendMessage(
    @Body() body: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { content, type, guildId, friendId } = body;

    if (type === ChatType.GUILD && !guildId) {
      throw new BadRequestException('Guild ID is required for guild messages');
    }

    if (type === ChatType.FRIEND && !friendId) {
      throw new BadRequestException(
        'Friend ID is required for friend messages',
      );
    }

    return this.chatService.sendMessage({
      content,
      type,
      guildId,
      friendId,
      senderId: user.id,
    });
  }

  @Get('guild/:guildId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getGuildMessages(
    @Param('guildId') guildId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.getGuildMessages(guildId);
  }

  @Get('friend/:friendId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFriendMessages(
    @Param('friendId') friendId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.getFriendMessages(friendId);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getConversations(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Conversations functionality not implemented yet',
      userId: user.id,
    };
  }
}
