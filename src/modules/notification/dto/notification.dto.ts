import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType }) type: NotificationType;
  @ApiProperty() title: string;
  @ApiProperty() message: string;
  @ApiProperty({ type: Object, required: false }) data?: Record<string, any>;
}
