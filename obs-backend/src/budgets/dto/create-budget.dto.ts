import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsString()
  budgetName: string;

  @IsNotEmpty()
  @IsNumber()
  idClient: number;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsNumber()
  idUser: number;

  @IsNotEmpty()
  @IsString()
  userResponsibility: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  procedures: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  estimatedPrice: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  finalPrice: number;

  @IsNotEmpty()
  @IsDateString()
  validityDate: string | Date;
}
