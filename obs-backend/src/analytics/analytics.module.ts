import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { StockModule } from 'src/stock/stock.module';
import { StockMovementModule } from 'src/stock-movement/stock-movement.module';
import { CommandsModule } from 'src/commands/commands.module';
import { FinancialsModule } from 'src/financials/financials.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [StockModule, StockMovementModule, CommandsModule, FinancialsModule]
})
export class AnalyticsModule {}
