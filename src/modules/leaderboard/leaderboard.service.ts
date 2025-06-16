import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';

@Injectable()
export class LeaderboardService {
  private readonly redisKey = 'leaderboard:global';

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async updateUserScore(userId: string, score: number) {
    await this.redis.zadd(this.redisKey, score, userId);
  }

  async getGlobalLeaderboard(limit = 20) {
    // Lấy top userId từ Redis
    const userIds = await this.redis.zrevrange(this.redisKey, 0, limit - 1);
    // Lấy thông tin user từ DB
    const users = await this.userRepo.findByIds(userIds);
    // Trả về theo thứ tự điểm
    return userIds.map(id => {
      const user = users.find(u => u.id === id);
      return user ? {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        points: user.totalPoints,
        level: user.level,
      } : null;
    }).filter(Boolean);
  }

  async setUserScoreFromDB(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      await this.updateUserScore(userId, user.totalPoints);
    }
  }
}
