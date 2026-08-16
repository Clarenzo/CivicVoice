import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: "Get all users (admin only)" })
    async findAll(@Query("role") role?: string, @Query("search") search?: string) {
        return this.usersService.findAll({ role: role as any, search });
    }

    @Get(":id")
    @ApiOperation({ summary: "Get user by ID" })
    async findOne(@Param("id") id: string) {
        return this.usersService.findOne(id);
    }
}