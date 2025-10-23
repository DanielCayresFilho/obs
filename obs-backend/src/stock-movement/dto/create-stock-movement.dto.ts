import { IsBoolean, IsNotEmpty,  isNumber,  IsNumber, IsOptional } from "class-validator";
import { StockType, MovementType } from "@prisma/client";


export class CreateStockMovementDto {

    @IsNumber()
    idStock: number;

    @IsNotEmpty()
    nameStock: string;

    @IsNumber({maxDecimalPlaces: 2})
    cost: number;

    @IsNumber({maxDecimalPlaces: 2})
    used: number;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    length?: number;

    @IsNotEmpty()
    stockType: StockType;

    @IsBoolean()
    operational: boolean;

    @IsNotEmpty()    
    movementType: MovementType;


}
