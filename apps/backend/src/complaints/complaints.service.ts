import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateComplaintDto, UpdateComplaintStatusDto } from "./dto";
import { ComplaintStatus, Priority, Role } from "@prisma/client";
import { title } from "process";

@Injectable()
export class ComplaintsService {
    constructor(private prisma: PrismaService) {}

    async create(createComplaintDto: CreateComplaintDto, userId?: string, userRole?: string, ipAddress?: string) {
        // Only citizens can submit complaints
        if (userId && userRole && userRole !== "CITIZEN") {
            throw new ForbiddenException("Only citizens can submit complaints");
        }
        
        // Generate a tracking number: CV-YYYY-XXXXXX
        const trackingNumber = await this.generateTrackingNumber();

        try {
            const complaint = await this.prisma.complaint.create({
                data: {
                    trackingNumber,
                    title: createComplaintDto.title,
                    description: createComplaintDto.description,
                    categoryId: createComplaintDto.categoryId,
                    departmentId: createComplaintDto.departmentId,
                    citizenId: userId || undefined,
                    submitterName: createComplaintDto.submitterName || undefined,
                    submitterEmail: createComplaintDto.submitterEmail || undefined,
                    submitterPhone: createComplaintDto.submitterPhone || undefined,
                    isAnonymous: createComplaintDto.isAnonymous || false,
                    location: createComplaintDto.location,
                    latitude: createComplaintDto.latitude,
                    longitude: createComplaintDto.longitude,
                    priority: createComplaintDto.priority || "MEDIUM",
                    language: createComplaintDto.language || "en",
                    ipAddress,
                    status: "SUBMITTED",
                },
                include: {
                    category: true,
                    department: true,
                },
            });

            // Create initial status history
            await this.prisma.statusChange.create({
                data: {
                    complaintId: complaint.id,
                    status: "SUBMITTED",
                    note: "Complaint submitted",
                    changedById: userId || complaint.id,
                },
            });

            return complaint;
            } catch (error) {
                console.error("Error creating complaint:", error);
                throw error;
            }
        }

    /**
     * Find complaints for citizens - only their own complaints
     */

    async findMyComplaints(userId: string, filters: {
        status?: ComplaintStatus;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, search, page = 1, limit = 20 } = filters;

        const where: any = {
            citizenId: userId, // Only shows complaints submitted by current user
            deletedAt: null, // Exclude soft-deleted
        };

        if (status) where.status = status;

        if (search) {
            where.OR = [
                { trackingNumber: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
            ];
        }

        const [complaints, total] = await Promise.all([
            this.prisma.complaint.findMany({
                where,
                include: {
                    category: true,
                    department: true,
                    _count: {
                        select: { attachments: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.complaint.count({ where }),
        ]);

        return {
            complaints,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find all complaints (admin/handler) - all complaints with filters
     */

    async findAll(filters: {
        status?: ComplaintStatus;
        priority?: Priority;
        categoryId?: string;
        departmentId?: string;
        assignedToId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, priority, categoryId, departmentId, assignedToId, search, page = 1, limit = 20 } = filters;

        const where: any = {
            deletedAt: null, // Excludes soft-deleted
        };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (categoryId) where.categoryId = categoryId;
        if (departmentId) where.departmentId = departmentId;
        if (assignedToId) where.assignedToId = assignedToId;

        if (search) {
            where.OR = [
                { trackingNumber: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { submitterName: { contains: search, mode: "insensitive" } },
                { submitterEmail: { contains: search, mode: "insensitive" } },
            ];
        }

        const [complaints, total] = await Promise.all([
            this.prisma.complaint.findMany({
                where,
                include: {
                    category: true,
                    department: true,
                    citizen: {
                        select: { id: true, name: true, email: true },
                    },
                    assignedTo: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: { attachments: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.complaint.count({ where }),
        ]);

        return {
            complaints,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { id },
            include: {
                category: true,
                department: true,
                citizen: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
                attachments: true,
                statusChanges: {
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!complaint) {
            throw new NotFoundException("Complaint not found");
        }

        return complaint;
    }

    async findByTrackingNumber(trackingNumber: string) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { trackingNumber },
            include: {
                category: true,
                department: true,
                statusChanges: {
                    include: {
                        changedBy: {
                            select: { name: true, role: true },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!complaint) {
            throw new NotFoundException("Complaint not found");
        }

        // Don't expose sensitive info for anonymous complaints
        if (complaint.isAnonymous) {
            return {
                trackingNumber: complaint.trackingNumber,
                title: complaint.title,
                status: complaint.status,
                priority: complaint.priority,
                category: complaint.category,
                department: complaint.department,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt,
                statusChanges: complaint.statusChanges,
                resolution: complaint.status === "RESOLVED" || complaint.status === "CLOSED"
                    ? complaint.resolution
                    : undefined,
            };
        }

        return complaint;
    }

    async updateStatus(
        id: string,
        updateDto: UpdateComplaintStatusDto,
        userId: string
    ) {
        const complaint = await this.prisma.complaint.findUnique({ where: { id } });

        if (!complaint) {
            throw new NotFoundException("Complaint not found");
        }

        const updatedComplaint = await this.prisma.complaint.update({
            where: { id },
            data: {
                status: updateDto.status,
                resolution: updateDto.resolution,
                resolvedAt: updateDto.status === "RESOLVED" ? new Date() : undefined,
            },
        });

        // Add to status history
        await this.prisma.statusChange.create({
            data: {
                complaintId: id,
                status: updateDto.status,
                note: updateDto.note,
                changedById: userId,
            },
        });

        return updatedComplaint;
    }

    async assignTo(id: string, assignedToId: string) {
        return this.prisma.complaint.update({
            where: { id },
            data: { assignedToId },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Soft delete a complaint (moves to trash)
     * Actually deletes after 30 days via a schedules job
     */
    async softDelete(id: string, userId: string) {
        const complaint = await this.prisma.complaint.findUnique({ where: { id} });

        if (!complaint) {
            throw new NotFoundException("Complaint not found");
        }

        // Only allow deletion by the citizen who submitted or admin
        // For now, only allow if user owns the complaint
        if (complaint.citizenId !== userId) {
            throw new ForbiddenException("You can only delete your owncomplaints");
        }

        return this.prisma.complaint.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted complaint from trash
     */
    async restore(id: string) {
            return this.prisma.complaint.update({
                where: { id },
                data: {
                    deletedAt: null,
            },
        }); 
    }

    /**
     * Get statistics for admin dashboard
     */
    async getStats() {
        const [
            totalComplaints,
            submittedCount,
            inProgressCount,
            resolvedCount,
            recentComplaints,
        ] = await Promise.all([
            this.prisma.complaint.count({ where: { deletedAt: null } }),
            this.prisma.complaint.count({ where: { status: "SUBMITTED", deletedAt: null } }),
            this.prisma.complaint.count({ where: { status: { in: ["UNDER_REVIEW", "IN_PROGRESS"] }, deletedAt: null } }),
            this.prisma.complaint.count({ where: { status: { in: ["RESOLVED", "CLOSED"] }, deletedAt: null } }),
            this.prisma.complaint.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    category: true,
                    department: true,
                    citizen: { select: { name: true, email: true } },
                },
            }),
        ]);

        return {
            total: totalComplaints,
            submitted: submittedCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
            recentComplaints,
        };
    }

    private async generateTrackingNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `CV-${year}-`;

        // Get the last complaint number for this year
        const lastComplaint = await this.prisma.complaint.findFirst({
            where: {
                trackingNumber: { startsWith: prefix },
            },
            orderBy: { trackingNumber: "desc" },
        });

        let sequence = 1;
        if (lastComplaint) {
            const lastSequence = parseInt(lastComplaint.trackingNumber.split("-")[2], 10);
            sequence = lastSequence + 1;
        }

        return `${prefix}${sequence.toString().padStart(6, "0")}`;
    }
}