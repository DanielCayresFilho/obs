import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  tattooStyle: string;

  @IsOptional()
  @IsInt()
  estimatedTime?: number;

  @IsOptional()
  @IsString()
  bodyLocation?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  totalPrice: number;

  @IsDateString()
  @IsNotEmpty()
  appointmentDate: Date;

  @IsOptional()
  @IsUrl()
  appointmentPicture?: string;

  @IsInt()
  @IsNotEmpty()
  commandId: number;
}
