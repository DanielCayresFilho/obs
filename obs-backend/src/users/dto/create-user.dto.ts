import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  name: string;

  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsDateString()
  birthday: string | Date;

  @IsOptional()
  @IsUrl() 
  userPicture?: string;
}
