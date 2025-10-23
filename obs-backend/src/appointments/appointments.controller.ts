import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/commands/:commandId/appointments')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('commandId', ParseIntPipe) commandId: number,
    @Body() createAppointmentDto: CreateAppointmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.appointmentsService.create(commandId, createAppointmentDto, file );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/waiting')
  findWaiting() {
    return this.appointmentsService.findAwaiting();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
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
        return this.appointmentsService.updateProfilePic(clientId, file);
      }
}
