import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { Prisma, procedures } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProceduresService {
  constructor(private prisma: PrismaService) {}

  async create(createProcedureDto: CreateProcedureDto): Promise<procedures> {
    return await this.prisma.procedures.create({ data: createProcedureDto });
  }

  async findAll(): Promise<procedures[]> {
    return await this.prisma.procedures.findMany();
  }

  async findOne(id: number): Promise<procedures> {
    const procedure = await this.prisma.procedures.findUnique({
      where: { id },
    });

    if (!procedure) {
      throw new BadRequestException('Id not found');
    }

    return procedure;
  }

  async update(
    id: number,
    updateProcedureDto: UpdateProcedureDto,
  ): Promise<procedures> {
    await this.findOne(id);

    return this.prisma.procedures.update({
      where: { id },
      data: { ...updateProcedureDto },
    });
  }

  async remove(id: number): Promise<procedures> {
    await this.findOne(id);

    return this.prisma.procedures.delete({ where: { id } });
  }
}
