import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ConvertBudgetDto } from './dto/convert-budget.dto';
import { PrismaService } from 'prisma/prisma.service';
import { budgets, BudgetStatus, PaymentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

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

  async convertToCommand(id: number, convertDto: ConvertBudgetDto) {
    const budget = await this.findOne(id);

    if (budget.status === 'converted') {
      throw new BadRequestException('Budget already converted');
    }

    if (budget.status !== 'approved') {
      throw new BadRequestException('Only approved budgets can be converted');
    }

    // Calcular preço com taxa de pagamento
    let totalPriceWithFee = Number(budget.finalPrice);

    switch (convertDto.paymentType) {
      case PaymentType.debit:
        totalPriceWithFee *= 1.0088;
        break;
      case PaymentType.credit:
        totalPriceWithFee *= 1.0314;
        break;
      case PaymentType.credit2x:
      case PaymentType.credit3x:
      case PaymentType.credit4x:
      case PaymentType.credit5x:
      case PaymentType.credit6x:
        totalPriceWithFee *= 1.0948;
        break;
      default:
        break;
    }

    totalPriceWithFee = parseFloat(totalPriceWithFee.toFixed(2));

    // Criar comanda
    const command = await this.prisma.commands.create({
      data: {
        commandName: budget.budgetName,
        idUser: budget.idUser,
        userResponsibility: budget.userResponsibility,
        idClient: budget.idClient,
        clienteName: budget.clientName,
        discount: budget.discount,
        totalPrice: totalPriceWithFee,
        paymentType: convertDto.paymentType,
        commandStatus: 'waiting',
      }
    });

    // Parsear procedimentos e criar appointments
    const proceduresArray = JSON.parse(budget.procedures);

    for (const procedure of proceduresArray) {
      await this.prisma.appointments.create({
        data: {
          procedure: procedure,
          appointmentDate: new Date(convertDto.appointmentDate),
          commandId: command.id,
          appointment: 'waiting',
        }
      });
    }

    // Atualizar status do budget
    await this.prisma.budgets.update({
      where: { id },
      data: {
        status: 'converted',
        linkedCommandId: command.id,
      }
    });

    return {
      message: 'Budget converted successfully',
      command,
    };
  }

  async getTotalPendingValue(): Promise<{ total: number }> {
    const budgets = await this.prisma.budgets.findMany({
      where: {
        status: 'pending'
      },
      select: {
        finalPrice: true,
      },
    });

    let total = new Decimal(0);

    budgets.forEach(({ finalPrice }) => {
      total = total.plus(finalPrice || 0);
    });

    return { total: total.toNumber() };
  }
}
