import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() body: CreateUserDto,
  @UploadedFile() file?: Express.Multer.File
) {
    return this.usersService.create(body, file);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
  

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Body() body: UpdateUserDto, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.update(body, id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
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
    @Param('id', ParseIntPipe) userId: number, 
    @UploadedFile() file: Express.Multer.File, 
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    // Apenas chama o serviço para fazer todo o trabalho pesado
    return this.usersService.updateProfilePic(userId, file);
  }
}
