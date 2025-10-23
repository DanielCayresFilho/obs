import { Module } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';
import { PrismaService } from 'prisma/prisma.service';
import { StockService } from 'src/stock/stock.service';

@Module({
  controllers: [StockMovementController],
  providers: [StockMovementService, PrismaService, StockService],
  exports: [StockMovementService]
})
export class StockMovementModule {}
