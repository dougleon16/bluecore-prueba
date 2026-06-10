import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreditRequestsService } from './credit-requests.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RequestStatus } from './entities/credit-request.entity';

interface AuthenticatedRequest extends Express.Request {
  user: { id: number; email: string };
}

@UseGuards(AuthGuard('jwt'))
@Controller('credit-requests')
export class CreditRequestsController {
  constructor(private readonly creditRequestsService: CreditRequestsService) {}

  @Post()
  create(
    @Body() dto: CreateCreditRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditRequestsService.create(dto, req.user);
  }

  @Get()
  findAll(@Query('status') status?: RequestStatus) {
    return this.creditRequestsService.findAll(status);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.creditRequestsService.updateStatus(id, dto);
  }
}
