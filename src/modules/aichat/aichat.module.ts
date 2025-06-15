import { Module } from '@nestjs/common';
import { AiChatService } from './aichat.service';
import { AiChatController } from './aichat.controller';

@Module({
  providers: [AiChatService],
  controllers: [AiChatController],
})
export class AiChatModule {}
