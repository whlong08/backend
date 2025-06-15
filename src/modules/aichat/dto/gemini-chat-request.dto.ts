import { ApiProperty } from '@nestjs/swagger';

export class GeminiChatRequestDto {
  @ApiProperty()
  prompt!: string;
}
