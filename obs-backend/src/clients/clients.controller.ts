import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, UseInterceptors, ParseIntPipe, UploadedFile, BadRequestException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() createClientDto: CreateClientDto,  @UploadedFile() file?: Express.Multer.File,) {
    return this.clientsService.create(createClientDto, file);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('/birthday')
  findBirthday() {
    return this.clientsService.findBirthday();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }
  
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @UploadedFile() file?: Express.Multer.File,) {
    return this.clientsService.update(+id, updateClientDto, file);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
    @Put(':id/profile-pic')
    @UseInterceptors(
      FileInterceptor('file', {
        limits: { fileSize: 1024 * 1024 * 15 }, 
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
          }
          cb(null, true);
        },
      }),
    )
    async uploadProfilePic(
      @Param('id', ParseIntPipe) clientId: number, 
      @UploadedFile() file: Express.Multer.File, 
    ) {
      if (!file) {
        throw new BadRequestException('Nenhum arquivo enviado.');
      }
      // Apenas chama o serviço para fazer todo o trabalho pesado
      return this.clientsService.updateProfilePic(clientId, file);
    }
}
