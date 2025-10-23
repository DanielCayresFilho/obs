import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { PrismaService } from 'prisma/prisma.service';
import { financials } from '@prisma/client';

@Injectable()
export class FinancialsService {

  constructor(private prisma: PrismaService) {}

  async create(createFinancialDto: CreateFinancialDto): Promise<financials> {
  const data = {
    ...createFinancialDto,
    ...(createFinancialDto.vencimentDay && {
      vencimentDay: new Date(createFinancialDto.vencimentDay),
    }),
  };

  return await this.prisma.financials.create({ data });
}


  async findAll(): Promise<financials[]> {
    return await this.prisma.financials.findMany();
  }

  async findOne(id: number): Promise<financials> {
    const financial = await this.prisma.financials.findUnique({where: {id}})
    
    if(!financial) {
      throw new NotFoundException('Id not found')
    }

    return financial
  }

  async update(id: number, updateFinancialDto: UpdateFinancialDto): Promise<financials> {
  await this.findOne(id);

  if (updateFinancialDto.vencimentDay) {
    updateFinancialDto.vencimentDay = new Date(updateFinancialDto.vencimentDay);
  }

  return this.prisma.financials.update({
    where: { id },
    data: updateFinancialDto,
  }); }


  async remove(id: number): Promise<financials> {

    await this.findOne(id);

    return await this.prisma.financials.delete({where: {id}});
  }

  async accountValues(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.financials.aggregate({
      where: {
        OR: [
          {
            vencimentDay: {
              gte: today,
            },
          },
          {
            paymentStatus: {
              not: 'paid', 
            },
          },
        ],
      },
      _sum: {
        price: true,
      },
    });

    return result._sum.price?.toNumber() || 0;
  }
}
