import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DepartmentsService } from "./departments.service";

@ApiTags("departments")
@Controller("departments")
export class DepartmentsController {
    constructor(private departmentsService: DepartmentsService) {}

    @Get()
    @ApiOperation({ summary: "Get all departments" })
    async findAll(@Query("agencyId") agencyId?: string) {
        return this.departmentsService.findAll(agencyId);
    }
}