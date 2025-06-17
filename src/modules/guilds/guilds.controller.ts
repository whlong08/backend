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
import { GuildsService } from './guilds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateGuildDto, UpdateGuildDto } from './dto/guild.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';
import { GuildMembersService } from './guild-members.service';
import { Request } from 'express';

@ApiTags('Guilds')
@Controller('guilds')
export class GuildsController {
  constructor(
    private readonly guildsService: GuildsService,
    private readonly guildMembersService: GuildMembersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateGuildDto })
  create(@Body() body: CreateGuildDto, @CurrentUser() user: any) {
    return this.guildsService.create({ ...body, ownerId: user.id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    // Lấy tất cả guild mà user là thành viên
    const memberGuilds = await this.guildMembersService.getGuildIdsByUser(
      user.id,
    );
    return this.guildsService.findByIds(memberGuilds);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const isMember = await this.guildMembersService.isMember(id, user.id);
    if (!isMember)
      throw new ForbiddenException('Only guild members can view this guild');
    return this.guildsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateGuildDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateGuildDto,
    @CurrentUser() user: any,
  ) {
    const guild = await this.guildsService.findOne(id);
    if (guild.ownerId !== user.id) {
      throw new ForbiddenException('Only owner can update this guild');
    }
    return this.guildsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const guild = await this.guildsService.findOne(id);
    if (guild.ownerId !== user.id) {
      throw new ForbiddenException('Only owner can delete this guild');
    }
    return this.guildsService.remove(id);
  }
}
