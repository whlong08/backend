import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GeminiChatRequestDto {
  @ApiProperty()
  @IsString()
  prompt!: string;
}
