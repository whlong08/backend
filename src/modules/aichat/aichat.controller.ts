import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiChatService } from './aichat.service';
import { GeminiChatRequestDto } from './dto/gemini-chat-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Chat')
@ApiBearerAuth('AUTHORIZATION-JWT')
@UseGuards(JwtAuthGuard)
@Controller('aichat')
export class AiChatController {
  constructor(private readonly service: AiChatService) {}

  @Post('chat')
  async generateResponse(
    @Body() request: GeminiChatRequestDto,
  ) {
    return this.service.chatCompletion(request);
  }
}
