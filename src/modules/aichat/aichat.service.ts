import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

// Định nghĩa lại type cho message theo OpenAI SDK
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
};

@Injectable()
export class AiChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }

  async chat(messages: ChatMessage[]) {
    // Chỉ truyền các trường hợp role hợp lệ, không ép kiểu về ChatCompletionMessageParam
    const response = await this.openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages,
    });
    return response.choices[0].message;
  }
}
