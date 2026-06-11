import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreditRequestsService } from './credit-requests.service';
import { CreditRequest, RequestStatus } from './entities/credit-request.entity';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('CreditRequestsService', () => {
  let service: CreditRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditRequestsService,
        {
          provide: getRepositoryToken(CreditRequest),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CreditRequestsService>(CreditRequestsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates and saves a new credit request', async () => {
      const dto = { cedula: '1234567890', amount: 1000, termMonths: 12 };
      const user = { id: 1 };
      const created = {
        ...dto,
        createdBy: { id: 1 },
        status: RequestStatus.PENDING,
      };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create(dto, user);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });
  });

  describe('findAll', () => {
    it('returns all requests when no status filter is given', async () => {
      const list = [{ id: 1 }, { id: 2 }];
      mockRepository.find.mockResolvedValue(list);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(list);
    });

    it('returns filtered requests when status is provided', async () => {
      const list = [{ id: 1, status: RequestStatus.PENDING }];
      mockRepository.find.mockResolvedValue(list);

      const result = await service.findAll(RequestStatus.PENDING);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: RequestStatus.PENDING },
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(list);
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when the request does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: RequestStatus.APPROVED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when trying to change a non-pending request', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        status: RequestStatus.APPROVED,
      });

      await expect(
        service.updateStatus(1, {
          status: RequestStatus.REJECTED,
          comment: 'some reason',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when rejecting without a comment', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        status: RequestStatus.PENDING,
      });

      await expect(
        service.updateStatus(1, { status: RequestStatus.REJECTED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('approves a pending request and returns the updated record', async () => {
      const pending = { id: 1, status: RequestStatus.PENDING, comment: null };
      mockRepository.findOne.mockResolvedValue(pending);
      mockRepository.save.mockImplementation((r: CreditRequest) =>
        Promise.resolve(r),
      );

      const result = await service.updateStatus(1, {
        status: RequestStatus.APPROVED,
      });

      expect(result.status).toBe(RequestStatus.APPROVED);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('rejects a pending request when a comment is provided', async () => {
      const pending = { id: 2, status: RequestStatus.PENDING, comment: null };
      mockRepository.findOne.mockResolvedValue(pending);
      mockRepository.save.mockImplementation((r: CreditRequest) =>
        Promise.resolve(r),
      );

      const result = await service.updateStatus(2, {
        status: RequestStatus.REJECTED,
        comment: 'Insufficient income',
      });

      expect(result.status).toBe(RequestStatus.REJECTED);
      expect(result.comment).toBe('Insufficient income');
    });
  });
});
