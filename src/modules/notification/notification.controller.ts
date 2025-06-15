import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationType } from '../../entities/notification.entity';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(@CurrentUser() user: any) {
    return this.notificationService.findAll(user.id);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: { type: NotificationType; title: string; message: string; data?: Record<string, any> }) {
    return this.notificationService.create(user.id, body.type, body.title, body.message, body.data);
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markRead(id, user.id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.delete(id, user.id);
  }
}
