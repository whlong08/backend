import { Injectable, Logger, Inject, ForbiddenException } from '@nestjs/common';
import OpenAI from 'openai';
import { GeminiChatRequestDto } from './dto/gemini-chat-request.dto';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class AiChatService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiChatService.name);
  private readonly aiChatLimit: number;
  private readonly aiChatLimitKeyPrefix = 'ai_chat_limit:';

  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.openai = new OpenAI({
      apiKey: configService.get<string>('GEMINI_API_KEY'),
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    this.aiChatLimit = Number(configService.get('AI_CHAT_DAILY_LIMIT') ?? 20);
  }

  async chatCompletion(request: GeminiChatRequestDto, userId: string) {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const key = `${this.aiChatLimitKeyPrefix}${userId}:${today}`;
    let limit = this.aiChatLimit;
    // Check if user has custom limit (for upgrade logic)
    const customLimit = await this.redis.get(`${key}:max`);
    if (customLimit) limit = Number(customLimit);
    const used = Number((await this.redis.get(key)) || 0);
    if (used >= limit) {
      throw new ForbiddenException('Daily AI chat limit reached');
    }
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt },
        ],
        model: 'gemini-2.0-flash',
      });
      // Increase usage
      await this.redis
        .multi()
        .incr(key)
        .expireat(
          key,
          Math.floor(new Date(today + 'T23:59:59Z').getTime() / 1000),
        )
        .exec();
      return completion.choices[0].message;
    } catch (error) {
      this.logger.error('Gemini API error', error);
      throw error;
    }
  }

  // Logic để nâng cấp limit cho user (có thể gọi khi user mua gói nâng cấp)
  async upgradeLimit(userId: string, newLimit: number) {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${this.aiChatLimitKeyPrefix}${userId}:${today}:max`;
    await this.redis.set(key, newLimit, 'EX', 60 * 60 * 24); // expire sau 1 ngày
  }
}
