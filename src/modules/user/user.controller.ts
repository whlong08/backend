import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiBody({ type: UpdateUserProfileDto })
  async updateProfile(@CurrentUser() user: any, @Body() body: UpdateUserProfileDto) {
    return this.userService.updateProfile(user.id, body);
  }
}
