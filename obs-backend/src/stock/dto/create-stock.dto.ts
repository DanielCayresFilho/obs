import { IsNotEmpty, IsNumber } from "class-validator";
import { StockType } from '@prisma/client'


export class CreateStockDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    type: StockType;
    
    @IsNumber({maxDecimalPlaces: 2})
    price: number;

    @IsNumber()
    quantity: number;
    
    @IsNumber({maxDecimalPlaces: 2})
    length: number;

    @IsNumber({maxDecimalPlaces: 2})
    usable: number;

    @IsNotEmpty()
    category: string


}
