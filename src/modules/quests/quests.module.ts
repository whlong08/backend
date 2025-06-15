import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from '../../entities/quest.entity';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quest])],
  providers: [QuestsService],
  controllers: [QuestsController],
  exports: [QuestsService],
})
export class QuestsModule {}
