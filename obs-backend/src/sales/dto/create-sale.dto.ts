import { IsInt, IsNumber, IsOptional, IsEnum, IsString, Min } from 'class-validator';
import { PaymentType, PaymentStatus } from '@prisma/client';

export class CreateSaleDto {
  @IsInt()
  idStock: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number; // Opcional, pode usar o preço do stock

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsString()
  clientName?: string;
}