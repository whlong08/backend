import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateGuildDto, UpdateGuildDto } from './dto/guild.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Guilds')
@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateGuildDto })
  create(@Body() body: CreateGuildDto, @CurrentUser() user: any) {
    return this.guildsService.create({ ...body, ownerId: user.id });
  }

  @Get()
  findAll() {
    return this.guildsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const guild = await this.guildsService.findOne(id);
    return guild;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateGuildDto })
  async update(@Param('id') id: string, @Body() body: UpdateGuildDto, @CurrentUser() user: any) {
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
