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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreditRequestsService } from './credit-requests.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RequestStatus } from './entities/credit-request.entity';

interface AuthenticatedRequest extends Express.Request {
  user: { id: number; email: string };
}

@ApiTags('Credit Requests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('credit-requests')
export class CreditRequestsController {
  constructor(private readonly creditRequestsService: CreditRequestsService) {}

  @ApiOperation({ summary: 'Create a new credit request' })
  @ApiResponse({ status: 201, description: 'Credit request created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  create(
    @Body() dto: CreateCreditRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditRequestsService.create(dto, req.user);
  }

  @ApiOperation({
    summary: 'List all credit requests, optionally filtered by status',
  })
  @ApiQuery({ name: 'status', enum: RequestStatus, required: false })
  @ApiResponse({ status: 200, description: 'Array of credit requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(@Query('status') status?: RequestStatus) {
    return this.creditRequestsService.findAll(status);
  }

  @ApiOperation({ summary: 'Approve or reject a credit request' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Credit request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.creditRequestsService.updateStatus(id, dto);
  }
}
