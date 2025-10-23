import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommandDto: CreateCommandDto) {
    return this.commandsService.create(createCommandDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.commandsService.findAll();
  }
   
  @UseGuards(JwtAuthGuard)
  @Get('/waiting')
  findWaiting() {
    return this.commandsService.findWaiting();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/done')
  findDone() {
    return this.commandsService.totalDone();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandsService.findOne(+id);
  }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCommandDto: UpdateCommandDto) {
    return this.commandsService.update(+id, updateCommandDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandsService.remove(+id);
  }
}
