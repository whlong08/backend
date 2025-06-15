import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { Quest } from '../../entities/quest.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Partial<Quest>, @CurrentUser() user: any) {
    // Gán creatorId là user hiện tại
    return this.questsService.create({ ...body, creatorId: user.id });
  }

  @Get()
  findAll() {
    return this.questsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: Partial<Quest>, @CurrentUser() user: any) {
    const quest = await this.questsService.findOne(id);
    if (quest.creatorId !== user.id) {
      throw new ForbiddenException('Only creator can update this quest');
    }
    return this.questsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const quest = await this.questsService.findOne(id);
    if (quest.creatorId !== user.id) {
      throw new ForbiddenException('Only creator can delete this quest');
    }
    return this.questsService.remove(id);
  }
}
