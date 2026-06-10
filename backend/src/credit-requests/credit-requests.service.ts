import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditRequest, RequestStatus } from './entities/credit-request.entity';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
@Injectable()
export class CreditRequestsService {
  constructor(
    @InjectRepository(CreditRequest)
    private readonly repository: Repository<CreditRequest>,
  ) {}

  create(
    dto: CreateCreditRequestDto,
    user: { id: number },
  ): Promise<CreditRequest> {
    const request = this.repository.create({
      ...dto,
      createdBy: { id: user.id },
    });
    return this.repository.save(request);
  }

  findAll(status?: RequestStatus): Promise<CreditRequest[]> {
    return this.repository.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, dto: UpdateStatusDto): Promise<CreditRequest> {
    const request = await this.repository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Credit request #${id} not found`);
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be approved or rejected',
      );
    }

    if (dto.status === RequestStatus.REJECTED && !dto.comment?.trim()) {
      throw new BadRequestException(
        'A comment is required when rejecting a request',
      );
    }

    request.status = dto.status;
    request.comment = dto.comment ?? null;

    return this.repository.save(request);
  }
}
