import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovement, StockType } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { Decimal } from 'decimal.js'; // Use the decimal.js library for calculations
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementService {
  constructor(private readonly Prisma: PrismaService) {}

  /**
   * Creates a new stock movement and atomically updates the corresponding stock item.
   */
  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
  const { idStock, movementType, used, length, quantity } = createStockMovementDto;

  console.log('Received DTO:', createStockMovementDto);

  return this.Prisma.$transaction(async (tx) => {
    const stockItem = await tx.stock.findUnique({
      where: { id: Number(idStock) },
    });

    if (!stockItem) {
      throw new NotFoundException(`Stock item with ID ${idStock} not found.`);
    }

    console.log('Stock item:', stockItem);

    let currentUsable = new Decimal(stockItem.usable);
    let currentQuantity = stockItem.quantity;
    let costOfMovement = new Decimal(0);

    if (movementType === 'output') {
      // Validações de used
      if (used === undefined || used === null) {
        throw new BadRequestException('Used amount must be provided for output movements.');
      }
      if (typeof used !== 'number' || isNaN(used) || used <= 0) {
        throw new BadRequestException('Used amount must be a number greater than zero.');
      }

      const usedAmount = new Decimal(used);

      if (currentUsable.lessThan(usedAmount)) {
        throw new BadRequestException('Insufficient usable stock for this output.');
      }

      // Valida length do stock para cálculo
      if (!stockItem.length || new Decimal(stockItem.length).isZero()) {
        throw new BadRequestException('Stock item length cannot be zero or undefined for cost calculation.');
      }

      currentUsable = currentUsable.minus(usedAmount);
      currentQuantity = currentUsable.dividedBy(stockItem.length).floor().toNumber();

      costOfMovement = new Decimal(stockItem.price)
        .dividedBy(stockItem.length)
        .times(usedAmount);

    } else if (movementType === 'input') {
      // Validar length e quantity
      if (length === undefined || length === null) {
        throw new BadRequestException('Length must be provided for input movements.');
      }
      if (quantity === undefined || quantity === null) {
        throw new BadRequestException('Quantity must be provided for input movements.');
      }
      if (typeof length !== 'number' || isNaN(length) || length <= 0) {
        throw new BadRequestException('Length must be a number greater than zero.');
      }
      if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
        throw new BadRequestException('Quantity must be a number greater than zero.');
      }

      const inputLength = new Decimal(length);
      const inputQuantity = new Decimal(quantity);

      currentUsable = currentUsable.add(inputLength.times(inputQuantity));
      currentQuantity += inputQuantity.toNumber();

      // Input não gera custo diretamente
      costOfMovement = new Decimal(0);

    } else {
      throw new BadRequestException(`Invalid movement type: ${movementType}`);
    }

    console.log('Updated usable:', currentUsable.toString());
    console.log('Updated quantity:', currentQuantity);
    console.log('Cost of movement:', costOfMovement.toString());

    // Atualiza o estoque
    await tx.stock.update({
      where: { id: stockItem.id },
      data: {
        usable: currentUsable.toNumber(),
        quantity: currentQuantity,
      },
    });

    // Cria o movimento
    return tx.stockMovement.create({
      data: {
        ...createStockMovementDto,
        idStock: Number(idStock),
        cost: costOfMovement.toNumber(),
      },
    });
  });
}

  /**
   * Finds all stock movements.
   */
  async findAll(): Promise<StockMovement[]> {
    return this.Prisma.stockMovement.findMany();
  }

  /**
   * Finds a single stock movement by its ID.
   */
  async findOne(id: number): Promise<StockMovement> {
    const movement = await this.Prisma.stockMovement.findUnique({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Stock Movement with ID ${id} not found.`);
    }
    return movement;
  }

  async findByCommand(commandId: number): Promise<StockMovement[]> {
  const movements = await this.Prisma.stockMovement.findMany({
    where: { commandId },
  });

  if (movements.length === 0) {
    throw new NotFoundException(`No stock movements found for command ID ${commandId}.`);
  }

  return movements;
}


  /**
   * Updates a stock movement. This is a complex operation that reverses the original
   * movement and applies the new one to ensure stock levels remain consistent.
   */
  async update(id: number, updateDto: UpdateStockMovementDto): Promise<StockMovement> {
    return this.Prisma.$transaction(async (tx) => {
      // 1. Get the original movement before any changes
      const originalMovement = await tx.stockMovement.findUnique({ where: { id } });
      if (!originalMovement) {
        throw new NotFoundException(`Stock Movement with ID ${id} not found.`);
      }

      // 2. Get the associated stock item
      const stockItem = await tx.stock.findUnique({ where: { id: originalMovement.idStock } });
      if (!stockItem) {
        throw new NotFoundException(`Associated Stock item with ID ${originalMovement.idStock} not found.`);
      }

      // 3. Reverse the effect of the ORIGINAL movement
      let usable = new Decimal(stockItem.usable);
      let quantity = stockItem.quantity;

      if (originalMovement.movementType === 'input') {
        // Safely handle potential null values from the original record
        const originalQuantity = originalMovement.quantity ?? 0;
        const originalLength = new Decimal(originalMovement.length ?? 0);
        
        const originalUsableAdded = originalLength.times(originalQuantity);
        usable = usable.minus(originalUsableAdded);
        quantity -= originalQuantity;
      } else if (originalMovement.movementType === 'output') {
        const originalUsed = new Decimal(originalMovement.used ?? 0);
        usable = usable.add(originalUsed);
      }

      // Create a temporary movement object with the updated data
      const newMovementData = { ...originalMovement, ...updateDto };

      // 4. Apply the effect of the NEW (updated) movement
      if (newMovementData.movementType === 'input') {
        const newQuantity = newMovementData.quantity ?? 0;
        const newLength = new Decimal(newMovementData.length ?? 0);

        if (newLength.isZero() || newQuantity === 0) {
            throw new BadRequestException('Length and quantity are required and cannot be zero for an input movement.');
        }

        const newUsableToAdd = newLength.times(newQuantity);
        usable = usable.add(newUsableToAdd);
        quantity += newQuantity;
      } else if (newMovementData.movementType === 'output') {
        const usedAmount = new Decimal(newMovementData.used ?? 0);
        if (usable.lessThan(usedAmount)) {
          throw new BadRequestException('Insufficient stock after update.');
        }
        usable = usable.minus(usedAmount);
      }
      
      // Recalculate quantity based on the final usable amount
      if (!stockItem.length.isZero()) {
        quantity = usable.dividedBy(stockItem.length).floor().toNumber();
      } else {
        quantity = 0; // If length is 0, quantity must be 0
      }

      // 5. Update the stock item and the stock movement
      await tx.stock.update({
        where: { id: stockItem.id },
        data: { usable, quantity },
      });

      return tx.stockMovement.update({
        where: { id },
        data: { ...updateDto },
      });
    });
  }

  /**
   * Removes a stock movement and atomically reverses its effect on the stock item.
   */
  async remove(id: number): Promise<StockMovement> {
    return this.Prisma.$transaction(async (tx) => {
      // 1. Find the movement to be deleted.
      const movementToDelete = await tx.stockMovement.findUnique({ where: { id } });
      if (!movementToDelete) {
        throw new NotFoundException(`Stock Movement with ID ${id} not found.`);
      }

      // 2. Find the associated stock item.
      const stockItem = await tx.stock.findUnique({ where: { id: movementToDelete.idStock } });
      if (!stockItem) {
        throw new NotFoundException(`Associated Stock item with ID ${movementToDelete.idStock} not found.`);
      }
      
      let currentUsable = new Decimal(stockItem.usable);
      let currentQuantity = stockItem.quantity;
      
      // 3. REVERSE the effect of the movement.
      if (movementToDelete.movementType === 'input') {
        // If it was an input, we SUBTRACT the added amount.
        const quantityToDelete = movementToDelete.quantity ?? 0;
        const lengthToDelete = new Decimal(movementToDelete.length ?? 0);

        const usableToRemove = lengthToDelete.times(quantityToDelete);
        currentUsable = currentUsable.minus(usableToRemove);
        currentQuantity -= quantityToDelete;
      } else if (movementToDelete.movementType === 'output') {
        // If it was an output, we ADD the used amount back.
        const usedToDelete = new Decimal(movementToDelete.used ?? 0);
        currentUsable = currentUsable.add(usedToDelete);
      }

      // Recalculate quantity after usable is updated, unless length is 0
      if (!stockItem.length.isZero()) {
         currentQuantity = currentUsable.dividedBy(stockItem.length).floor().toNumber();
      } else {
         currentQuantity = 0;
      }

      // Ensure stock levels don't go negative due to data inconsistencies
      if (currentUsable.isNegative()) {
        throw new Error('Stock reversal resulted in a negative usable amount. Please check data consistency.');
      }
      if (currentQuantity < 0) {
        currentQuantity = 0; // Or throw an error as this indicates a problem
      }

      // 4. Update the stock item with the reversed values.
      await tx.stock.update({
        where: { id: stockItem.id },
        data: {
          usable: currentUsable,
          quantity: currentQuantity,
        },
      });

      // 5. Finally, delete the movement record.
      return tx.stockMovement.delete({ where: { id } });
    });
  }

  async operationalTypeValue(operational: boolean, type: StockType, startdate?: string, enddate?: string){
    
    const whereCommand: Prisma.StockMovementWhereInput = {
      stockType: type,
      operational: operational
    }

    if(startdate && enddate) {
      whereCommand.createdAt = {
        gte: new Date(startdate),
        lte: new Date(enddate)
      }
    }

    const finalQuery = await this.Prisma.stockMovement.aggregate({where: whereCommand, _sum: {cost: true}})

    return finalQuery._sum.cost || 0;
  }
}