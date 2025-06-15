import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('leaderboard')
export class LeaderboardController {
  @Get('global')
  getGlobal() {
    // Trả về bảng xếp hạng toàn bộ (public)
    return [
      { username: 'user1', points: 100 },
      { username: 'user2', points: 90 },
    ];
  }

  @Get('personal')
  @UseGuards(JwtAuthGuard)
  getPersonal(@CurrentUser() user: any) {
    // Trả về bảng xếp hạng cá nhân hóa (chỉ user đăng nhập)
    return { username: user.username, points: 42 };
  }
}
