import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { StockModule } from './stock/stock.module';
import { StockMovementModule } from './stock-movement/stock-movement.module';
import { CommandsModule } from './commands/commands.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { FinancialsModule } from './financials/financials.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SalesModule } from './sales/sales.module';
import { BudgetsModule } from './budgets/budgets.module';

@Module({
  imports: [UsersModule, AuthModule, ClientsModule, StockModule, StockMovementModule, CommandsModule, AppointmentsModule, FinancialsModule, AnalyticsModule, SalesModule, BudgetsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }

