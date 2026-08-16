import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean, IsNumber, MaxLength, IsEmail } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ComplaintStatus, Priority } from "@prisma/client";

export class CreateComplaintDto {
    @ApiProperty({ example: "Pothole on Kenyatta Avenue" })
    @IsString()
    @MaxLength(150)
    title!: string;

    @ApiProperty({ example: "There is a large pothole near the traffic light at the junction..." })
    @IsString()
    @MaxLength(5000)
    description!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    submitterName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    submitterEmail?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    submitterPhone?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isAnonymous?: boolean;

    @ApiPropertyOptional({ example: "Kenyatta Avenue, Nairobi" })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: -1.2921 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 36.8219 })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @ApiPropertyOptional({ example: "en" })
    @IsOptional()
    @IsString()
    language?: string;
}

export class UpdateComplaintStatusDto {
    @ApiProperty({ enum: ComplaintStatus })
    @IsEnum(ComplaintStatus)
    status!: ComplaintStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    resolution?: string;
}

export class ComplaintQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(ComplaintStatus)
    status?: ComplaintStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    limit?: number;
}