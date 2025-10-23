import { Controller, Get, Query, ParseBoolPipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { StockType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Retorna o valor total do estoque atual.
   * Rota: GET /analytics/stock-value
   */
  @UseGuards(JwtAuthGuard)
  @Get('stock-value')
  async getStockValue() {
    return this.analyticsService.stockValue();
  }

  /**
   * Retorna o valor total de movimentações de estoque com base nos filtros.
   * Rota: GET /analytics/stock-movement-value
   * Exemplo: /analytics/stock-movement-value?operational=true&type=SAIDA&startdate=2025-01-01&enddate=2025-01-31
   */
  @UseGuards(JwtAuthGuard)
  @Get('stock-movement-value')
  async getStockMovementValue(
    @Query('operational', ParseBoolPipe) operational: boolean,
    @Query('type') type: StockType,
    @Query('startdate') startdate?: string,
    @Query('enddate') enddate?: string,
  ) {
    // O NestJS (com ValidationPipe) converte a string da URL para boolean e enum automaticamente.
    return this.analyticsService.stockMovementValue(
      operational,
      type,
      startdate,
      enddate,
    );
  }

  /**
   * Retorna o valor total movimentado em comandas, com filtros opcionais.
   * Rota: GET /analytics/commands-value
   * Exemplo: /analytics/commands-value?userid=1
   */
@UseGuards(JwtAuthGuard)
@Get('commands-value')
async getCommandsValue(
  @Query('userid', new ParseIntPipe({ optional: true })) userid?: number,
  @Query('startdate') startdate?: string,
  @Query('enddate') enddate?: string,
) {
  return this.analyticsService.commandsValues(userid, startdate, enddate);
}

@UseGuards(JwtAuthGuard)
@Get('commands-this-value')
async getCommandsValueThis(
  @Query('userid', new ParseIntPipe({ optional: true })) userid?: number,
) {
  return this.analyticsService.commandsValuesThis(userid);
}

@UseGuards(JwtAuthGuard)
@Get('commands-this-value-paid')
async getCommandsValueThisPaid(
  @Query('userid', new ParseIntPipe({ optional: true })) userid?: number,
) {
  return this.analyticsService.commandsValuesThisPaid(userid);
}

  /**
   * Retorna valores financeiros (ex: contas a pagar/receber).
   * Rota: GET /analytics/financials-value
   */
  @UseGuards(JwtAuthGuard)
  @Get('financials-value') // Corrigi o pequeno erro de digitação de "finnancials"
  async getFinancialsValue() {
    return this.analyticsService.finnancialsValues();
  }
}