import { Body, Controller, Post, UseGuards, Headers, Logger } from '@nestjs/common';
import { AiChatService } from './aichat.service';
import { GeminiChatRequestDto } from './dto/gemini-chat-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Chat')
@ApiBearerAuth('AUTHORIZATION-JWT')
@UseGuards(JwtAuthGuard)
@Controller('aichat')
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);
  constructor(private readonly service: AiChatService) {}

  @Post('chat')
  async generateResponse(
    @Body() request: GeminiChatRequestDto,
    @Headers() headers: any
  ) {
    this.logger.log('AIChatController /aichat/chat request.body: ' + JSON.stringify(request));
    this.logger.log('AIChatController /aichat/chat headers: ' + JSON.stringify(headers));
    return this.service.chatCompletion(request);
  }
}
