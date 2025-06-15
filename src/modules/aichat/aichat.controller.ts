import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AiChatService } from './aichat.service';

@Controller('aichat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  async chat(
    @CurrentUser() user: any,
    @Body('messages') messages: { role: string; content: string }[]
  ) {
    // Chuyển role về đúng type cho OpenAI SDK
    const safeMessages = messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));
    return this.aiChatService.chat(safeMessages);
  }
}
