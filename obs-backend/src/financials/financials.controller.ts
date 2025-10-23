import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FinancialsService } from './financials.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('financials')
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFinancialDto: CreateFinancialDto) {
    return this.financialsService.create(createFinancialDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.financialsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinancialDto: UpdateFinancialDto) {
    return this.financialsService.update(+id, updateFinancialDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financialsService.remove(+id);
  }
}
