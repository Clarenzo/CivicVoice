import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    complaint: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    statusChange: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createComplaintDto = {
      title: 'Pothole on Main Street',
      description: 'There is a large pothole that needs attention.',
      categoryId: 'category-id',
      submitterName: 'John Citizen',
      submitterEmail: 'john@example.com',
    };

    it('should create a complaint with tracking number', async () => {
      mockPrismaService.complaint.findFirst.mockResolvedValue(null);
      mockPrismaService.complaint.create.mockResolvedValue({
        id: 'complaint-id',
        trackingNumber: 'CV-2026-000001',
        ...createComplaintDto,
        status: 'SUBMITTED',
        createdAt: new Date(),
      });
      mockPrismaService.statusChange.create.mockResolvedValue({});

      const result = await service.create(createComplaintDto);

      expect(result).toHaveProperty('trackingNumber');
      expect(result.trackingNumber).toMatch(/^CV-\d{4}-\d{6}$/);
      expect(mockPrismaService.complaint.create).toHaveBeenCalled();
      expect(mockPrismaService.statusChange.create).toHaveBeenCalled();
    });

    it('should generate sequential tracking numbers', async () => {
      // First complaint
      mockPrismaService.complaint.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.complaint.create.mockResolvedValueOnce({
        id: 'complaint-1',
        trackingNumber: 'CV-2026-000001',
        ...createComplaintDto,
      });
      mockPrismaService.statusChange.create.mockResolvedValue({});

      await service.create(createComplaintDto);

      // Second complaint - should have next sequence
      mockPrismaService.complaint.findFirst.mockResolvedValueOnce({
        trackingNumber: 'CV-2026-000001',
      });
      mockPrismaService.complaint.create.mockResolvedValueOnce({
        id: 'complaint-2',
        trackingNumber: 'CV-2026-000002',
        ...createComplaintDto,
      });
      mockPrismaService.statusChange.create.mockResolvedValue({});

      const result2 = await service.create(createComplaintDto);

      expect(result2.trackingNumber).toBe('CV-2026-000002');
    });
  });



  describe('findOne', () => {
    it('should return a complaint by id', async () => {
      const mockComplaint = {
        id: 'complaint-id',
        trackingNumber: 'CV-2026-000001',
        title: 'Test Complaint',
        description: 'Test description',
        status: 'SUBMITTED',
        category: { name: 'Infrastructure' },
        department: { name: 'Roads' },
      };

      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      const result = await service.findOne('complaint-id');

      expect(result).toEqual(mockComplaint);
      expect(mockPrismaService.complaint.findUnique).toHaveBeenCalledWith({
        where: { id: 'complaint-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if complaint not found', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTrackingNumber', () => {
    it('should return complaint details for valid tracking number', async () => {
      const mockComplaint = {
        id: 'complaint-id',
        trackingNumber: 'CV-2026-000001',
        title: 'Test Complaint',
        description: 'Test description',
        status: 'SUBMITTED',
        isAnonymous: false,
        statusHistory: [],
      };

      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      const result = await service.findByTrackingNumber('CV-2026-000001');

      expect(result.trackingNumber).toBe('CV-2026-000001');
    });

    it('should hide citizen info for anonymous complaints', async () => {
      const mockComplaint = {
        id: 'complaint-id',
        trackingNumber: 'CV-2026-000001',
        title: 'Anonymous Complaint',
        description: 'Secret info',
        status: 'SUBMITTED',
        isAnonymous: true,
        submitterName: 'John Doe',
        submitterEmail: 'john@example.com',
        submitterPhone: '+254700000000',
        citizen: { name: 'Hidden User', email: 'hidden@example.com' },
        statusHistory: [],
      };

      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      const result = await service.findByTrackingNumber('CV-2026-000001');

      expect(result).not.toHaveProperty('submitterName');
      expect(result).not.toHaveProperty('citizen');
    });

    it('should throw NotFoundException for invalid tracking number', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.findByTrackingNumber('CV-INVALID')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update complaint status', async () => {
      const existingComplaint = {
        id: 'complaint-id',
        trackingNumber: 'CV-2026-000001',
        status: 'SUBMITTED',
      };

      const updateDto = {
        status: 'UNDER_REVIEW' as any,
        note: 'Starting investigation',
      };

      mockPrismaService.complaint.findUnique.mockResolvedValue(existingComplaint);
      mockPrismaService.complaint.update.mockResolvedValue({
        ...existingComplaint,
        status: 'UNDER_REVIEW',
      });
      mockPrismaService.statusChange.create.mockResolvedValue({});

      const result = await service.updateStatus('complaint-id', updateDto, 'user-id');

      expect(result.status).toBe('UNDER_REVIEW');
      expect(mockPrismaService.statusChange.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent', { status: 'UNDER_REVIEW' as any }, 'user-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated complaints', async () => {
      const mockComplaints = [
        { id: '1', title: 'Complaint 1' },
        { id: '2', title: 'Complaint 2' },
      ];

      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.complaints).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.complaint.findMany.mockResolvedValue([]);
      mockPrismaService.complaint.count.mockResolvedValue(0);

      await service.findAll({ status: 'SUBMITTED' as any });

      expect(mockPrismaService.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUBMITTED',
          }),
        })
      );
    });

    it('should search by tracking number or title', async () => {
      mockPrismaService.complaint.findMany.mockResolvedValue([]);
      mockPrismaService.complaint.count.mockResolvedValue(0);

      await service.findAll({ search: 'pothole' });

      expect(mockPrismaService.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });
});
