import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from '../../../entities/chat-message.entity';

export class SendChatMessageSwaggerDto {
  @ApiProperty({ enum: ChatType }) type: ChatType;
  @ApiProperty({ required: false }) guildId?: string;
  @ApiProperty({ required: false }) friendId?: string;
  @ApiProperty() senderId: string;
  @ApiProperty() content: string;
}
