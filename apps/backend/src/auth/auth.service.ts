import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto, LoginDto } from "./dto";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { email, phone, password, name, nationalId } = registerDto;

        // Password required so bcrypt gets a definite string
        if (!password) {
            throw new BadRequestException("Password is required");
        }

        // At least one of email or phone must be provided
        if (!email && !phone) {
            throw new BadRequestException("Either email or phone is required");
        }

        // Build lookup conditions, filtering out nulls with type guard
        const conditions = [
            email ? { email } : null,
            phone ? { phone } : null,
            nationalId ? { nationalId } : null,
        ].filter((c): c is NonNullable<typeof c> => c !== null);

        const existingUser = await this.prisma.user.findFirst({
            where: { OR: conditions },
        });

        if (existingUser) {
            throw new ConflictException("User with this email, phone, or national ID already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                name,
                nationalId,
                role: "CITIZEN",
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate tokens (refresh token is persisted in DB)
        const tokens = await this.generateTokens(user.id, user.role);

        return {
            user,
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (user.status !== "ACTIVE") {
            throw new UnauthorizedException("Account is not active");
        }

        const tokens = await this.generateTokens(user.id, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        };
    }

    async refreshTokens(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is required");
        }

        // Look up the token in the DB to verify it's still valid (supports revocation)
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (storedToken.expiresAt < new Date()) {
            // Clean up expired token
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});
            throw new UnauthorizedException("Refresh token expired");
        }

        if (storedToken.user.status !== "ACTIVE") {
            throw new UnauthorizedException("Account is not active");
        }

        // Verify JWT signature (defense in depth, though DB check is primary)
        try {
            this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});
            throw new UnauthorizedException("Invalid refresh token");
        }

        // Rotate: delete old refresh token, issue new pair
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});

        const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.role);
        return tokens;
    }

    async logout(refreshToken: string) {
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
        }
        return { success: true };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        return user;
    }

    private async generateTokens(userId: string, role: string) {
        const payload = { sub: userId, role };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: "7d",
        });

        // Persist refresh token in DB so we can revoke it
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}
