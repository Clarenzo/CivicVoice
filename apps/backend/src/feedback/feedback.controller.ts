import { Controller, Post, Get, Body, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { IsString, MaxLength, IsOptional } from "class-validator";
import { FeedbackService } from "./feedback.service";
import { AuthenticatedRequest } from "../auth/authenticated-request";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/guards/role.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt.guard";
import { Role } from "@prisma/client";

export class CreateFeedbackDto {
    @IsString()
    @MaxLength(150)
    title!: string;

    @IsString()
    @MaxLength(2000)
    description!: string;

    @IsString()
    category!: string;

    @IsOptional()
    @IsString()
    language?: string;
}

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: "Submit general feedback" })
    async create(@Body() dto: CreateFeedbackDto, @Request() req: AuthenticatedRequest) {
        return this.feedbackService.create({
            ...dto,
            userId: req.user?.id,
        });
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.SYSTEM_ADMIN, Role.AGENCY_ADMIN, Role.DEPARTMENT_ADMIN, Role.HANDLER)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get all feedback (admin)" })
    async findAll() {
        return this.feedbackService.findAll();
    }
}