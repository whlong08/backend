import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../entities/notification.entity';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
