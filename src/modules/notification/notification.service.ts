import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(recipientId: string, type: NotificationType, title: string, message: string, data: Record<string, any> = {}) {
    try {
      const notification = this.notificationRepo.create({
        recipientId,
        type,
        title,
        message,
        data,
        isRead: false,
      });
      return await this.notificationRepo.save(notification);
    } catch (error) {
      this.logger.error('Create notification error', error?.message, error?.stack);
      throw error;
    }
  }

  async findAll(recipientId: string) {
    return this.notificationRepo.find({ where: { recipientId }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string, recipientId: string) {
    const notification = await this.notificationRepo.findOne({ where: { id, recipientId } });
    if (!notification) return null;
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async delete(id: string, recipientId: string) {
    return this.notificationRepo.delete({ id, recipientId });
  }
}
