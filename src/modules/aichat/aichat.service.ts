import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { GeminiChatRequestDto } from './dto/gemini-chat-request.dto';

@Injectable()
export class AiChatService {
  private openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
  private readonly logger = new Logger(AiChatService.name);

  async chatCompletion(request: GeminiChatRequestDto) {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt },
        ],
        model: 'gemini-2.0-flash',
      });
      return completion.choices[0].message;
    } catch (error) {
      this.logger.error('Gemini API error', error);
      throw error;
    }
  }
}
