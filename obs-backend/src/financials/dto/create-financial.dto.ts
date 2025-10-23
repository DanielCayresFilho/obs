import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { PaymentStatus } from '@prisma/client'

export class CreateFinancialDto {

  @IsNotEmpty()
  @IsString()
  accountName: string
  
  @IsNotEmpty()
  @IsNumber({maxDecimalPlaces: 2})
  price: number
  
  @IsNotEmpty()
  @IsDateString()
  vencimentDay: string | Date;
  
  @IsNotEmpty()
  @IsString()
  paymentStatus: PaymentStatus
}
