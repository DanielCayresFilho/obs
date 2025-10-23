import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  procedure: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentDate: Date;

  @IsOptional()
  @IsUrl()
  appointmentPicture?: string
}
