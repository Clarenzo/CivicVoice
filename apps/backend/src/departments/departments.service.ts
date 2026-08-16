import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) {}

    async findAll(agencyId?: string) {
        return this.prisma.department.findMany({
            where: {
                isActive: true,
                agencyId: agencyId || undefined,
            },
            include: {
                agency: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { complaints: true },
                },
            },
            orderBy: { name: "asc" },
        });
    }
}