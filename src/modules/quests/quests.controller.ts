import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateQuestDto, UpdateQuestDto } from './dto/quest.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Quests')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateQuestDto })
  create(@Body() body: CreateQuestDto, @CurrentUser() user: AuthenticatedUser) {
    console.log('CreateQuestDto body:', body);
    return this.questsService.create({ ...body, creatorId: user.id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.questsService.findAllWithPrivate(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    const quest = await this.questsService.findOne(id);
    if (!quest.isPublic && quest.creatorId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to view this private quest',
      );
    }
    return quest;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateQuestDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateQuestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
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
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const quest = await this.questsService.findOne(id);
    if (quest.creatorId !== user.id) {
      throw new ForbiddenException('Only creator can delete this quest');
    }
    return this.questsService.remove(id);
  }
}
