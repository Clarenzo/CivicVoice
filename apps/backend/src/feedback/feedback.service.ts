import  { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) {}

    async create(data: { title: string; description: string; category: string; language?: string; userId?: string }) {
        return this.prisma.feedback.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                language: data.language || "en",
                userId: data.userId,
            },
        });
    }

    async findAll() {
        return this.prisma.feedback.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
    }
}