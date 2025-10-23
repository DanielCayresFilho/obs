import { Module } from '@nestjs/common';
import { FinancialsService } from './financials.service';
import { FinancialsController } from './financials.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [FinancialsController],
  providers: [FinancialsService, PrismaService],
  exports: [FinancialsService]
})
export class FinancialsModule {}
