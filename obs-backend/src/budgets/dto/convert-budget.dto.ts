import { IsNotEmpty, IsDateString, IsString } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class ConvertBudgetDto {
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string | Date;

  @IsNotEmpty()
  @IsString()
  paymentType: PaymentType;
}
