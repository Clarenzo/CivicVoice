import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId?: string; type: NotificationType; channel: string; subject?: string; message: string }) {
    // For MVP, we'll just log notifications. In production, integrate with email/SMS providers.
    console.log(`[Notification] ${data.type} to ${data.channel}: ${data.message}`);
    
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        status: 'PENDING',
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
