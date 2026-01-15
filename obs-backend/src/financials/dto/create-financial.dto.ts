import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator"
import { PaymentStatus } from '@prisma/client'

export class CreateFinancialDto {

  @IsNotEmpty()
  @IsString()
  accountName: string

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number

  @IsNotEmpty()
  @IsDateString()
  vencimentDay: string | Date;

  @IsNotEmpty()
  @IsString()
  paymentStatus: PaymentStatus

  @IsOptional()
  @IsBoolean()
  isRecurrent?: boolean

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  recurrenceDay?: number
}
