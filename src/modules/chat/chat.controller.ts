import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { SendChatMessageSwaggerDto } from './dto/send-chat-message-swagger.dto';
import { ApiBody, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { GuildMember } from '../../entities/guild.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(GuildMember)
    private readonly guildMemberRepo: Repository<GuildMember>,
  ) {}

  @Post('send')
  @ApiBody({ type: SendChatMessageSwaggerDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendMessage(@Body() body: SendChatMessageDto, @Req() req: Request) {
    const user = req.user as any;
    if (body.type === 'GUILD') {
      const isMember = await this.guildMemberRepo.findOne({
        where: { guildId: body.guildId, userId: user.id },
      });
      if (!isMember)
        throw new ForbiddenException('You are not a member of this guild');
    }
    if (body.type === 'FRIEND') {
      if (body.senderId !== user.id)
        throw new ForbiddenException('You are not the sender');
      // Có thể kiểm tra thêm quan hệ bạn bè nếu cần
    }
    return this.chatService.sendMessage(body);
  }

  @Get('guild')
  @ApiQuery({ name: 'guildId', type: String })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getGuildMessages(
    @Query('guildId') guildId: string,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const isMember = await this.guildMemberRepo.findOne({
      where: { guildId, userId: user.id },
    });
    if (!isMember)
      throw new ForbiddenException('You are not a member of this guild');
    return this.chatService.getGuildMessages(guildId, limit);
  }

  @Get('friend')
  @ApiQuery({ name: 'friendId', type: String })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getFriendMessages(
    @Query('friendId') friendId: string,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    // Có thể kiểm tra quan hệ bạn bè ở đây nếu cần
    return this.chatService.getFriendMessages(friendId, limit);
  }
}
