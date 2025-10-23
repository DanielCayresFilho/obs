import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { StockService } from 'src/stock/stock.service';
import { StockMovementService } from 'src/stock-movement/stock-movement.service';
import { StockType } from '@prisma/client';
import { CommandsService } from 'src/commands/commands.service';
import { FinancialsService } from 'src/financials/financials.service';

@Injectable()
export class AnalyticsService {
  constructor(private stock: StockService, 
              private stockMovement: StockMovementService,
              private commands: CommandsService,
              private financials: FinancialsService
            ) {}


  async stockValue() {
    return await this.stock.stockValue()
  }

  async stockMovementValue(operational: boolean, type: StockType, startdate?: string, enddate?: string) {
    return await this.stockMovement.operationalTypeValue(operational, type, startdate, enddate)
  }

  async commandsValues(userid?: number, startdate?: string, enddate?: string) {
    return await this.commands.commandsValues(userid, startdate, enddate)
  }

  async commandsValuesThis(userid?: number) {
    return await this.commands.commandsValuesThisMonth(userid)
  }

  async commandsValuesThisPaid(userid?: number) {
    return await this.commands.commandsValuesThisMonthPaid(userid)
  }

  async finnancialsValues() {
    return await this.financials.accountValues()
  }

}
