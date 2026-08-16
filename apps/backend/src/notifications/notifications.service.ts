import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId?: string; type: string; channel: string; subject?: string; message: string }) {
    // For MVP, we'll just log notifications. In production, integrate with email/SMS providers.
    console.log(`[Notification] ${data.type} to ${data.channel}: ${data.message}`);
    
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        status: 'PENDING',
      },
    });
  }
}
