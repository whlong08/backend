import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false }) bio?: string;
  @ApiProperty({ required: false }) subject?: string;
  // Thêm các trường khác nếu cần
}
