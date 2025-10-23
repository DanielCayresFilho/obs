import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, ParseIntPipe, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ConvertBudgetDto } from './dto/convert-budget.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BudgetStatus } from '@prisma/client';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('status') status?: BudgetStatus) {
    if (status) {
      return this.budgetsService.findByStatus(status);
    }
    return this.budgetsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending/total')
  getTotalPending() {
    return this.budgetsService.getTotalPendingValue();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateBudgetDto
  ) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/convert')
  convertToCommand(
    @Param('id', ParseIntPipe) id: number,
    @Body() convertDto: ConvertBudgetDto
  ) {
    return this.budgetsService.convertToCommand(id, convertDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(id);
  }
}
