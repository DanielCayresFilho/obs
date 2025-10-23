import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ProceduresController],
  providers: [ProceduresService, PrismaService],
})
export class ProceduresModule {}
