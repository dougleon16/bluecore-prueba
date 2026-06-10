import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateCreditRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Cedula is required' })
  cedula: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(500, { message: 'Minimum loan amount is $500' })
  @Max(50000, { message: 'Maximum loan amount is $50,000' })
  amount: number;

  @IsNumber({}, { message: 'Term must be a number' })
  @Min(6, { message: 'Minimum term is 6 months' })
  @Max(60, { message: 'Maximum term is 60 months' })
  termMonths: number;
}
