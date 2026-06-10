import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../entities/credit-request.entity';

const ALLOWED_TRANSITIONS = [RequestStatus.APPROVED, RequestStatus.REJECTED];

export class UpdateStatusDto {
  @IsEnum(ALLOWED_TRANSITIONS, {
    message: `Status must be one of: ${ALLOWED_TRANSITIONS.join(', ')}`,
  })
  status: RequestStatus.APPROVED | RequestStatus.REJECTED;

  @IsOptional()
  @IsString()
  comment?: string;
}
