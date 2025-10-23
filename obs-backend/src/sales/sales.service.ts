import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    // Buscar o item do stock
    const stockItem = await this.prisma.stock.findUnique({
      where: { id: createSaleDto.idStock },
    });

    if (!stockItem) {
      throw new NotFoundException(`Item de estoque com ID ${createSaleDto.idStock} não encontrado`);
    }

    // Verificar se há quantidade suficiente
    if (stockItem.quantity < createSaleDto.quantity) {
      throw new BadRequestException(
        `Quantidade insuficiente em estoque. Disponível: ${stockItem.quantity}, Solicitado: ${createSaleDto.quantity}`
      );
    }

    // Calcular preços - converter Decimal para number
    const unitPrice = createSaleDto.unitPrice ?? Number(stockItem.price);
    const totalPrice = unitPrice * createSaleDto.quantity;

    // Criar venda e movimentação em uma transação
    const sale = await this.prisma.$transaction(async (prisma) => {
      // Criar a venda
      const newSale = await prisma.sales.create({
        data: {
          idStock: stockItem.id,
          nameStock: stockItem.name,
          quantity: createSaleDto.quantity,
          unitPrice: new Prisma.Decimal(unitPrice),
          totalPrice: new Prisma.Decimal(totalPrice),
          paymentType: createSaleDto.paymentType,
          paymentStatus: createSaleDto.paymentStatus,
          clientId: createSaleDto.clientId,
          clientName: createSaleDto.clientName,
        },
      });

      // Criar movimentação de saída
      await prisma.stockMovement.create({
        data: {
          idStock: stockItem.id,
          nameStock: stockItem.name,
          cost: stockItem.price,
          used: new Prisma.Decimal(0),
          quantity: createSaleDto.quantity,
          stockType: stockItem.type,
          operational: false,
          movementType: 'output',
          saleId: newSale.id,
        },
      });

      // Atualizar quantidade no estoque
      await prisma.stock.update({
        where: { id: stockItem.id },
        data: {
          quantity: {
            decrement: createSaleDto.quantity,
          },
        },
      });

      return newSale;
    });

    return sale;
  }

  async findAll() {
    return this.prisma.sales.findMany({
      include: {
        stock: true,
        stockMovement: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sales.findUnique({
      where: { id },
      include: {
        stock: true,
        stockMovement: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.sales.update({
      where: { id },
      data: updateSaleDto,
      include: {
        stock: true,
        stockMovement: true,
      },
    });
  }

  async remove(id: number) {
    const sale = await this.findOne(id);

    // Reverter a venda em uma transação
    return this.prisma.$transaction(async (prisma) => {
      // Deletar movimentação
      if (sale.stockMovement) {
        await prisma.stockMovement.delete({
          where: { id: sale.stockMovement.id },
        });
      }

      // Restaurar quantidade no estoque
      await prisma.stock.update({
        where: { id: sale.idStock },
        data: {
          quantity: {
            increment: sale.quantity,
          },
        },
      });

      // Deletar venda
      return prisma.sales.delete({
        where: { id },
      });
    });
  }
}