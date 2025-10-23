import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';
import { IsOptional, IsString } from 'class-validator';
import { BudgetStatus } from '@prisma/client';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsOptional()
  @IsString()
  status?: BudgetStatus;
}
