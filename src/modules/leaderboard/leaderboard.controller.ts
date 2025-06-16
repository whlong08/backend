import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  async getGlobal(@Query('limit') limit?: number) {
    return this.leaderboardService.getGlobalLeaderboard(limit || 20);
  }

  @Get('personal')
  @UseGuards(JwtAuthGuard)
  async getPersonal(@CurrentUser() user: any) {
    await this.leaderboardService.setUserScoreFromDB(user.id);
    return {
      username: user.username,
      points: user.totalPoints,
      level: user.level,
    };
  }
}
