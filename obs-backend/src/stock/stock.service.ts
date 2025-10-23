import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from 'prisma/prisma.service';
import { StockModule } from './stock.module';
import { Stock } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService){}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    return await this.prisma.stock.create({data: createStockDto});
  }

  async findAll(): Promise<Stock[]> {
    return await this.prisma.stock.findMany()
  }
  

  async findOne(id: number): Promise<Stock> {
    
    const stockItem = await this.prisma.stock.findUnique({where: {id}})

    if(!stockItem) {
      throw new BadRequestException('No stock item with this id');
    }

    return stockItem;
  }

  async update(id: number, updateStockDto: UpdateStockDto): Promise<Stock> {
    
    await this.findOne(id)

    return this.prisma.stock.update({where: {id}, data: {...updateStockDto}})
  }

  async remove(id: number): Promise<Stock> {

    await this.findOne(id)

    return this.prisma.stock.delete({where: {id}})
  }

  async stockValue() {
    return await this.prisma.stock.aggregate({_sum: {price: true}})
  }
}
