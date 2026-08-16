import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findAll(filters?: { role?: Role; search?: string }) {
        const where: any = {};
        if (filters?.role) where.role = filters.role;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        assignedTo: true,
                        complaints: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }
}