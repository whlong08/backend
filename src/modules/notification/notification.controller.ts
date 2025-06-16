import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationType } from '../../entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(@CurrentUser() user: any) {
    return this.notificationService.findAll(user.id);
  }

  @Post()
  @ApiBody({ type: CreateNotificationDto })
  async create(@CurrentUser() user: any, @Body() body: CreateNotificationDto) {
    return this.notificationService.create(user.id, body.type, body.title, body.message, body.data);
  }

  @Patch(':id/read')
  @ApiParam({ name: 'id', type: String })
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markRead(id, user.id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.delete(id, user.id);
  }
}
