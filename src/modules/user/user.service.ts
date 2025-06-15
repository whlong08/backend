import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(userId, data);
    const updated = await this.getProfile(userId);
    if (!updated) throw new Error('User not found');
    return updated;
  }
}
