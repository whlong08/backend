import {
  Controller,
  Post,
  Delete,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { GuildMembersService } from './guild-members.service';
import { GuildRole } from '../../entities/guild.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  AddGuildMemberDto,
  UpdateGuildMemberRoleDto,
} from './dto/guild-member.dto';
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Guild Members')
@Controller('guilds/:guildId/members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuildMembersController {
  constructor(private readonly guildMembersService: GuildMembersService) {}

  @Post()
  @ApiBody({ type: AddGuildMemberDto })
  @ApiParam({ name: 'guildId', type: String })
  async addMember(
    @Param('guildId') guildId: string,
    @Body() body: AddGuildMemberDto,
    @CurrentUser() user: any,
  ) {
    // Chỉ owner hoặc admin mới được thêm thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find((m) => m.userId === user.id);
    if (!me || (me.role !== GuildRole.OWNER && me.role !== GuildRole.ADMIN)) {
      throw new ForbiddenException('Only owner or admin can add members');
    }
    return this.guildMembersService.addMember(guildId, body.userId, body.role);
  }

  @Delete(':userId')
  @ApiParam({ name: 'guildId', type: String })
  @ApiParam({ name: 'userId', type: String })
  async removeMember(
    @Param('guildId') guildId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    // Chỉ owner hoặc admin mới được xóa thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find((m) => m.userId === user.id);
    if (!me || (me.role !== GuildRole.OWNER && me.role !== GuildRole.ADMIN)) {
      throw new ForbiddenException('Only owner or admin can remove members');
    }
    return this.guildMembersService.removeMember(guildId, userId);
  }

  @Patch(':userId/role')
  @ApiBody({ type: UpdateGuildMemberRoleDto })
  @ApiParam({ name: 'guildId', type: String })
  @ApiParam({ name: 'userId', type: String })
  async updateRole(
    @Param('guildId') guildId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateGuildMemberRoleDto,
    @CurrentUser() user: any,
  ) {
    // Chỉ owner mới được đổi vai trò thành viên
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find((m) => m.userId === user.id);
    if (!me || me.role !== GuildRole.OWNER) {
      throw new ForbiddenException('Only owner can change member roles');
    }
    return this.guildMembersService.updateRole(guildId, userId, body.role);
  }

  @Get()
  @ApiParam({ name: 'guildId', type: String })
  async listMembers(
    @Param('guildId') guildId: string,
    @CurrentUser() user: any,
  ) {
    // Chỉ thành viên mới xem được danh sách
    const members = await this.guildMembersService.listMembers(guildId);
    const me = members.find((m) => m.userId === user.id);
    if (!me) {
      throw new ForbiddenException('Only guild members can view member list');
    }
    return members;
  }
}
