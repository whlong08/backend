import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Logger,
  Req,
} from '@nestjs/common';
import { AiChatService } from './aichat.service';
import { GeminiChatRequestDto } from './dto/gemini-chat-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('AI Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('aichat')
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);
  constructor(private readonly service: AiChatService) {}

  @Post('chat')
  @ApiBody({ type: GeminiChatRequestDto })
  async generateResponse(
    @Body() request: GeminiChatRequestDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    this.logger.log(
      'AIChatController /aichat/chat request.body: ' + JSON.stringify(request),
    );
    this.logger.log(
      'AIChatController /aichat/chat user: ' + JSON.stringify(user),
    );
    return this.service.chatCompletion(request, user.id);
  }
}
