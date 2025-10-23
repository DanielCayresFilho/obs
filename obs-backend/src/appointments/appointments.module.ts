import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaService } from 'prisma/prisma.service';
import { CommandsService } from 'src/commands/commands.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService, CommandsService],
})
export class AppointmentsModule {}
