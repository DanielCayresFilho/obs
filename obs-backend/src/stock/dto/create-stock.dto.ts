import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { StockType } from '@prisma/client'


export class CreateStockDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    type: StockType;

    @IsNumber({ maxDecimalPlaces: 2 })
    price: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    costPrice?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    salePrice?: number;

    @IsNumber()
    quantity: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    length: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    usable: number;

    @IsNotEmpty()
    category: string

}
