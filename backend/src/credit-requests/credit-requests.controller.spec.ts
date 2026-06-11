import { Test, TestingModule } from '@nestjs/testing';
import { CreditRequestsController } from './credit-requests.controller';
import { CreditRequestsService } from './credit-requests.service';
import { RequestStatus } from './entities/credit-request.entity';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  updateStatus: jest.fn(),
};

describe('CreditRequestsController', () => {
  let controller: CreditRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditRequestsController],
      providers: [{ provide: CreditRequestsService, useValue: mockService }],
    }).compile();

    controller = module.get<CreditRequestsController>(CreditRequestsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('delegates to service and returns the created record', async () => {
      const dto = { cedula: '1234567890', amount: 1000, termMonths: 12 };
      const user = { id: 1, email: 'user@test.com' };
      const req = { user } as unknown as Parameters<
        typeof controller.create
      >[1];
      const created = { id: 1, ...dto, status: RequestStatus.PENDING };
      mockService.create.mockResolvedValue(created);

      const result = await controller.create(dto, req);

      expect(mockService.create).toHaveBeenCalledWith(dto, user);
      expect(result).toBe(created);
    });
  });

  describe('findAll', () => {
    it('returns all requests when no status is provided', async () => {
      const list = [{ id: 1 }, { id: 2 }];
      mockService.findAll.mockResolvedValue(list);

      const result = await controller.findAll(undefined);

      expect(mockService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toBe(list);
    });

    it('passes the status filter through to the service', async () => {
      const list = [{ id: 1, status: RequestStatus.PENDING }];
      mockService.findAll.mockResolvedValue(list);

      const result = await controller.findAll(RequestStatus.PENDING);

      expect(mockService.findAll).toHaveBeenCalledWith(RequestStatus.PENDING);
      expect(result).toBe(list);
    });
  });

  describe('updateStatus', () => {
    it('delegates to service and returns the updated record', async () => {
      const dto = { status: RequestStatus.APPROVED };
      const updated = { id: 1, status: RequestStatus.APPROVED };
      mockService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus(
        1,
        dto as unknown as import('./dto/update-status.dto').UpdateStatusDto,
      );

      expect(mockService.updateStatus).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });
  });
});
