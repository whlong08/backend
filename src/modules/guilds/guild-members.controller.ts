import { Controller, Post, Delete, Patch, Get, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { GuildMembersService } from './guild-members.service';
import { GuildRole } from '../../entities/guild.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('guilds/:guildId/members')
@UseGuards(JwtAuthGuard)
export class GuildMembersController {
  constructor(private readonly guildMembersService: GuildMembersService) {}

  @Post()
  async addMember(
    @Param('guildId') guildId: string,
    @Body() body: { userId: string; role?: GuildRole },
    @CurrentUser() user: any
  ) {
    // Chỉ owner hoặc admin mới được thêm thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find(m => m.userId === user.id);
    if (!me || (me.role !== GuildRole.OWNER && me.role !== GuildRole.ADMIN)) {
      throw new ForbiddenException('Only owner or admin can add members');
    }
    return this.guildMembersService.addMember(guildId, body.userId, body.role);
  }

  @Delete(':userId')
  async removeMember(
    @Param('guildId') guildId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    // Chỉ owner hoặc admin mới được xóa thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find(m => m.userId === user.id);
    if (!me || (me.role !== GuildRole.OWNER && me.role !== GuildRole.ADMIN)) {
      throw new ForbiddenException('Only owner or admin can remove members');
    }
    return this.guildMembersService.removeMember(guildId, userId);
  }

  @Patch(':userId/role')
  async updateRole(
    @Param('guildId') guildId: string,
    @Param('userId') userId: string,
    @Body() body: { role: GuildRole },
    @CurrentUser() user: any
  ) {
    // Chỉ owner mới được đổi vai trò thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find(m => m.userId === user.id);
    if (!me || me.role !== GuildRole.OWNER) {
      throw new ForbiddenException('Only owner can change member roles');
    }
    return this.guildMembersService.updateRole(guildId, userId, body.role);
  }

  @Get()
  async listMembers(@Param('guildId') guildId: string, @CurrentUser() user: any) {
    // Chỉ thành viên mới xem được danh sách
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find(m => m.userId === user.id);
    if (!me) {
      throw new ForbiddenException('Only guild members can view member list');
    }
    return members;
  }
}
