import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './common/database.module';
import { QuestsModule } from './modules/quests/quests.module';
import { GuildsModule } from './modules/guilds/guilds.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AiChatModule } from './modules/aichat/aichat.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    QuestsModule,
    GuildsModule,
    LeaderboardModule,
    AiChatModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
