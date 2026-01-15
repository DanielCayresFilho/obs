import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'prisma/prisma.service';
import { budgets, BudgetStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) { }

  async create(createBudgetDto: CreateBudgetDto): Promise<budgets> {
    return await this.prisma.budgets.create({
      data: createBudgetDto
    });
  }

  async findAll(): Promise<budgets[]> {
    return await this.prisma.budgets.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByStatus(status: BudgetStatus): Promise<budgets[]> {
    return await this.prisma.budgets.findMany({
      where: { status },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: number): Promise<budgets> {
    const budget = await this.prisma.budgets.findUnique({
      where: { id }
    });

    if (!budget) {
      throw new BadRequestException('Budget not found');
    }

    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto): Promise<budgets> {
    await this.findOne(id);

    return await this.prisma.budgets.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(id: number): Promise<budgets> {
    await this.findOne(id);

    return await this.prisma.budgets.delete({
      where: { id }
    });
  }

  async getTotalPendingValue(): Promise<{ total: number }> {
    const budgets = await this.prisma.budgets.findMany({
      where: {
        status: 'pending'
      },
      select: {
        price: true,
      },
    });

    let total = new Decimal(0);

    budgets.forEach(({ price }) => {
      total = total.plus(price || 0);
    });

    return { total: total.toNumber() };
  }
}
