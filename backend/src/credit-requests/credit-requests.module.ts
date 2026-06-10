import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditRequest } from './entities/credit-request.entity';
import { CreditRequestsService } from './credit-requests.service';
import { CreditRequestsController } from './credit-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CreditRequest])],
  providers: [CreditRequestsService],
  controllers: [CreditRequestsController],
})
export class CreditRequestsModule {}
