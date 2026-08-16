import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}
    
    @Get()
    @ApiOperation({ summary: "Get all categories" })
    async findAll(@Query("departmentId") departmentId?: string) {
        return this.categoriesService.findAll(departmentId);
    }
}