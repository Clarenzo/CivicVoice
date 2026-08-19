import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Ip} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto, UpdateComplaintStatusDto, ComplaintQueryDto } from "./dto";
import { AuthenticatedRequest } from "../auth/authenticated-request";

@ApiTags("complaints")
@Controller("complaints")
export class ComplaintsController {
    constructor(private complaintsService: ComplaintsService) {}

    @Post()
    @ApiOperation({ summary: "Submit a new complaint (public)" })
    @ApiResponse({ status: 201, description: "Complaint submitted successfully" })
    async create(
        @Body() createComplaintDto: CreateComplaintDto,
        @Request() req: AuthenticatedRequest,
        @Ip() ip: string,
    ) {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const complaint = await this.complaintsService.create(createComplaintDto, userId, userRole, ip);

        return {
            success: true,
            data: complaint,
            message: "Complaint submitted successfully",
        };
    }

    @Get("track/:trackingNumber")
    @ApiOperation({ summary: "Track complaint status by tracking number (public)" })
    @ApiResponse({ status: 200, description: "Complaint found" })
    @ApiResponse({ status: 404, description: "Complaint not found" })
    async track(@Param("trackingNumber") trackingNumber: string) {
        return this.complaintsService.findByTrackingNumber(trackingNumber);
    }

    @Get("my")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get my complaints (citizen)" })
    async findMyComplaints(@Request() req: AuthenticatedRequest, @Query() query: ComplaintQueryDto) {
        return this.complaintsService.findMyComplaints(req.user.id, query);
    }

    @Get("stats")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get complaint statistics (admin)" })
    async getStats() {
        return this.complaintsService.getStats();
    }

    @Get()
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get all complaints (admin/handler)" })
    async findAll(@Query() query: ComplaintQueryDto) {
        return this.complaintsService.findAll(query);
    }

    @Get(":id")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get complaint by ID (admin/handler)" })
    async findOne(@Param("id") id: string) {
        return this.complaintsService.findOne(id);
    }

    @Put(":id/status")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update complaint status (admin/handler)" })
    async updateStatus(
        @Param("id") id: string,
        @Body() updateDto: UpdateComplaintStatusDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.complaintsService.updateStatus(id, updateDto, req.user.id);
    }

    @Put(":id/assign")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Assign complaint to handler (admin)" })
    async assign(@Param("id") id: string, @Body("assignedToId") assignedToId: string) {
        return this.complaintsService.assignTo(id, assignedToId);
    }

    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Soft delete a complaint (move to trash)" })
    async softDelete(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
        return this.complaintsService.softDelete(id, req.user.id);
    }

    @Put(":id/restore")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Restore a deleted complaint from trash" })
    async restore(@Param("id") id: string) {
        return this.complaintsService.restore(id);
    }
}