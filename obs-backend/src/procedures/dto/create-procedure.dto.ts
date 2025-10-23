import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProcedureDto {
  @IsNotEmpty()
  procedureName: string;

  @IsNotEmpty()
  procedureType: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  procedurePrice: number;
}
