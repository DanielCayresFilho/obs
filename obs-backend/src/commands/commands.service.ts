import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { PrismaService } from 'prisma/prisma.service';
import { commands, commandStatus, PaymentType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CommandsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommandDto: CreateCommandDto): Promise<commands> {
    // 1. Cria uma cópia dos dados recebidos para poder modificá-los
    const data = { ...createCommandDto };

    // 2. Verifica se um método de pagamento foi informado e aplica a taxa
    if (data.paymentType) {
      switch (data.paymentType) {
        case PaymentType.debit:
          // Adiciona taxa de 0.88%
          data.totalPrice *= 1.0088;
          break;
        case PaymentType.credit:
          // Adiciona taxa de 3.14%
          data.totalPrice *= 1.0314;
          break;
        // Caso para todas as formas de crédito parcelado
        case PaymentType.credit2x:
        case PaymentType.credit3x:
        case PaymentType.credit4x:
        case PaymentType.credit5x:
        case PaymentType.credit6x:
          // Adiciona taxa de 9.48%
          data.totalPrice *= 1.0948;
          break;
        // 'pix' e 'money' não têm taxas, então não fazemos nada
        default:
          break;
      }

      // 3. Arredonda o valor final para 2 casas decimais para evitar problemas com dízimas
      data.totalPrice = parseFloat(data.totalPrice.toFixed(2));
    }

    // 4. Salva no banco de dados com o valor já ajustado
    return await this.prisma.commands.create({ data });
  }

  async findAll(): Promise<commands[]> {
    return await this.prisma.commands.findMany();
  }


  async findOne(id: number): Promise<commands> {
    const command = await this.prisma.commands.findUnique({ where: { id } });

    if (!command) {
      throw new BadRequestException('Id not found');
    }

    return command;
  }

  async update(
    id: number,
    updateCommandDto: UpdateCommandDto,
  ): Promise<commands> {
    const existingCommand = await this.findOne(id);

    const dataToUpdate = { ...updateCommandDto };

    const grossPriceSource = dataToUpdate.totalPrice ?? existingCommand.totalPrice;
    const paymentType = dataToUpdate.paymentType ?? existingCommand.paymentType;
    
    // 👇 A CORREÇÃO ESTÁ AQUI 👇
    // Converte 'grossPriceSource' para um número primitivo antes de usar.
    const grossPrice = Number(grossPriceSource);

    let netPrice = grossPrice;

    switch (paymentType) {
      case PaymentType.debit:
        netPrice = grossPrice * 0.9912;
        break;
      case PaymentType.credit:
        netPrice = grossPrice * 0.9686;
        break;
      case PaymentType.credit2x:
      case PaymentType.credit3x:
      case PaymentType.credit4x:
      case PaymentType.credit5x:
      case PaymentType.credit6x:
        netPrice = grossPrice * 0.9052;
        break;
    }

    dataToUpdate.totalPrice = parseFloat(netPrice.toFixed(2));

    return await this.prisma.commands.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number): Promise<commands> {
    await this.findOne(id);

    return await this.prisma.commands.delete({ where: { id } });
  }

  // CORREÇÃO BÔNUS NESTA FUNÇÃO
  async commandsValues(userId?: number, startdate?: string, enddate?: string) {
  const where: Prisma.commandsWhereInput = {
    commandStatus: 'closed'
  };

  if (userId) {
    where.idUser = userId;
  }

  if (startdate && enddate) {
    where.createdAt = {
      gte: new Date(startdate),
      lte: new Date(enddate),
    };
  }

  const results = await this.prisma.commands.findMany({
    where,
    select: {
      totalPrice: true,
      createdAt: true,
    },
  });

  // Agrupar por mês usando JavaScript
  const groupedByMonth: Record<string, Decimal> = {};

results.forEach(({ createdAt, totalPrice }) => {
  const monthKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
  
  if (!groupedByMonth[monthKey]) {
    groupedByMonth[monthKey] = new Decimal(0);
  }

  groupedByMonth[monthKey] = groupedByMonth[monthKey].plus(totalPrice || 0);
});

  return groupedByMonth;
}


async commandsValuesThisMonth(userId?: number) {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const where: Prisma.commandsWhereInput = {
    commandStatus: 'waiting',
    createdAt: {
      gte: startOfMonth,
      lte: endOfMonth,
    }
  };

  if (userId) {
    where.idUser = userId;
  }

  const results = await this.prisma.commands.findMany({
    where,
    select: {
      totalPrice: true,
    },
  });

  // Somar todos os valores usando Decimal
  let total = new Decimal(0);

  results.forEach(({ totalPrice }) => {
    total = total.plus(totalPrice || 0);
  });

  return {
    month: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
    total: total.toNumber(), // ou .toFixed(2) se quiser string formatada
  };
}

  async findWaiting(): Promise<commands[]> {
  const commandStatus = 'waiting';

  return this.prisma.commands.findMany({
    where: { commandStatus }
  });
}

  async totalDone(): Promise<{ total: number }> {
  const commandStatus = 'closed';
  const total = await this.prisma.commands.count({ where: { commandStatus } });

  return { total };
}


async commandsValuesThisMonthPaid(userId?: number) {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const where: Prisma.commandsWhereInput = {
    commandStatus: 'closed',
    createdAt: {
      gte: startOfMonth,
      lte: endOfMonth,
    }
  };

  if (userId) {
    where.idUser = userId;
  }

  const results = await this.prisma.commands.findMany({
    where,
    select: {
      totalPrice: true,
    },
  });

  // Somar todos os valores usando Decimal
  let total = new Decimal(0);

  results.forEach(({ totalPrice }) => {
    total = total.plus(totalPrice || 0);
  });

  return {
    month: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
    total: total.toNumber(), // ou .toFixed(2) se quiser string formatada
  };
}



}