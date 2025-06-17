import { Controller, Get, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLeaderboard(@CurrentUser() user: AuthenticatedUser) {
    // Ensure user score is updated in Redis
    await this.leaderboardService.setUserScoreFromDB(user.id);

    const leaderboard = await this.leaderboardService.getGlobalLeaderboard();

    return leaderboard.map((entry: any) => ({
      userId: entry.id as string,
      username: entry.username as string,
      totalPoints: entry.points as number,
      level: entry.level as number,
    }));
  }

  @Get('top-performers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTopPerformers() {
    return this.leaderboardService.getGlobalLeaderboard(10);
  }

  @Get('user-rank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserRank(@CurrentUser() user: AuthenticatedUser) {
    await this.leaderboardService.setUserScoreFromDB(user.id);
    return { message: 'User rank functionality not implemented yet' };
  }
}
