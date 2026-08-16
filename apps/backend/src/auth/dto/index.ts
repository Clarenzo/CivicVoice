import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty({ example: "John Doe" })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiPropertyOptional({ example: "john.doe@example.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "+254 712345678" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: "12345678" })
    @IsOptional()
    @IsString()
    nationalId?: string;

    @ApiPropertyOptional({ example: "SecurePassword123!" })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password?: string;
}

export class LoginDto {
    @ApiProperty({ example: "john.doe@example.com" })
    @IsNotEmpty()
    @IsString()
    email?: string;

    @ApiProperty({ example: "SecurePassword123!" })
    @IsNotEmpty()
    @IsString()
    password?: string;
}

export class AuthResponseDto {
    @ApiProperty()
    user!: {
        id: string;
        email: string | null;
        phone: string | null;
        name: string;
        role: string;
    };

    @ApiProperty()
    accessToken!: string;

    @ApiProperty()
    refreshToken!: string;

}