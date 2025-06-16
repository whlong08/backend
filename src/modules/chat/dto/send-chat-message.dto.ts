import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatType } from '../../../entities/chat-message.entity';

export class SendChatMessageDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsString()
  guildId?: string;

  @IsOptional()
  @IsString()
  friendId?: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
