import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsNotEmpty()
  @IsDateString()
  validityDate: string | Date;
}
