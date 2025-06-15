import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { Guild } from '../../entities/guild.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Partial<Guild>, @CurrentUser() user: any) {
    // Gán ownerId là user hiện tại nếu chưa có
    return this.guildsService.create({ ...body, ownerId: body.ownerId || user.id });
  }

  @Get()
  findAll() {
    return this.guildsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Chỉ thành viên mới xem được chi tiết
    const guild = await this.guildsService.findOne(id);
    // (Có thể kiểm tra membership ở đây nếu muốn nâng cao)
    return guild;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: Partial<Guild>, @CurrentUser() user: any) {
    const guild = await this.guildsService.findOne(id);
    if (guild.ownerId !== user.id) {
      throw new ForbiddenException('Only owner can update this guild');
    }
    return this.guildsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const guild = await this.guildsService.findOne(id);
    if (guild.ownerId !== user.id) {
      throw new ForbiddenException('Only owner can delete this guild');
    }
    return this.guildsService.remove(id);
  }
}
