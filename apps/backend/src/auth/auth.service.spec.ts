import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        role: 'CITIZEN',
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation(async (data) => ({
        id: 'user-id',
        ...data.data,
        createdAt: new Date(),
      }));

      await service.register(registerDto);

      const createCall = mockPrismaService.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(registerDto.password);
      expect(createCall.data.password).toMatch(/^\$2[aby]?\$\d{1,2}\$/); // bcrypt hash pattern
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const hashedPassword = '$2b$10$hashedpassword';

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        status: 'ACTIVE',
        role: 'CITIZEN',
      });

      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        status: 'ACTIVE',
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        status: 'SUSPENDED',
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        phone: '+254712345678',
        name: 'John Doe',
        role: 'CITIZEN',
        status: 'ACTIVE',
        createdAt: new Date(),
        password: 'hashed-password-should-not-be-included',
      });

      const result = await service.getProfile('user-id');

      expect(result).not.toHaveProperty('password');
      expect(result!.email).toBe('john@example.com');
      expect(result!.name).toBe('John Doe');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const tokens = await (service as any).generateTokens('user-id', 'CITIZEN');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBe('mock-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
