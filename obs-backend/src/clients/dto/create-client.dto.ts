import { IsDateString, IsNotEmpty, IsOptional, IsUrl } from "class-validator";

export class CreateClientDto {
    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    phone: string;
    
    @IsDateString()
    birthday: string | Date;

    @IsNotEmpty()
    instagram: string;

    @IsOptional()
    @IsUrl()
    clientPicture?: string

}
