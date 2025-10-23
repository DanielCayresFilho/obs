import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentType } from '@prisma/client'

export class CreateCommandDto {
  @IsNotEmpty()
  @IsString()
  commandName: string;

  @IsNotEmpty()
  @IsNumber()
  idUser: number;

  @IsNotEmpty()
  @IsString()
  userResponsibility: string;

  @IsNotEmpty()
  @IsNumber()
  idClient: number;

  @IsNotEmpty()
  @IsString()
  clienteName: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalPrice: number;

  @IsString()
  @IsOptional()
  paymentType?: PaymentType
}