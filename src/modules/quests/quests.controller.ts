import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateQuestDto, UpdateQuestDto } from './dto/quest.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Quests')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateQuestDto })
  create(@Body() body: CreateQuestDto, @CurrentUser() user: any) {
    return this.questsService.create({ ...body, creatorId: user.id });
  }

  @Get()
  findAll() {
    return this.questsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.questsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateQuestDto })
  async update(@Param('id') id: string, @Body() body: UpdateQuestDto, @CurrentUser() user: any) {
    const quest = await this.questsService.findOne(id);
    if (quest.creatorId !== user.id) {
      throw new ForbiddenException('Only creator can update this quest');
    }
    return this.questsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const quest = await this.questsService.findOne(id);
    if (quest.creatorId !== user.id) {
      throw new ForbiddenException('Only creator can delete this quest');
    }
    return this.questsService.remove(id);
  }
}
