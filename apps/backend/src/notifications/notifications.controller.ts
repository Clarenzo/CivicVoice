import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async findAll() {
    return this.notificationsService.create({
      type: 'IN_APP',
      channel: 'test',
      message: 'Notifications endpoint ready',
    });
  }
}
