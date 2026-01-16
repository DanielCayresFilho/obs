import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { appointments } from '@prisma/client';

import { CommandsService } from '../commands/commands.service';
import { StorageService } from 'src/storage/storage.service';
import { extname } from 'path';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private commandsService: CommandsService,
    private storageService: StorageService
  ) { }

  async create(
    createAppointmentDto: CreateAppointmentDto,
    file?: Express.Multer.File,
  ): Promise<appointments> {
    // Verificar se o command existe
    await this.commandsService.findOne(createAppointmentDto.commandId);

    let photoUrl: string | null = null;

    if (file) {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

      const fileName = `appointments/${randomName}${extname(file.originalname)}`;
      photoUrl = await this.storageService.uploadFile(file, fileName);
    }

    const { commandId, appointmentDate, ...appointmentData } = createAppointmentDto;

    return this.prisma.appointments.create({
      data: {
        ...appointmentData,
        appointmentDate: new Date(appointmentDate),
        appointmentPicture: photoUrl,
        command: {
          connect: {
            id: commandId,
          },
        },
      },
    });
  }

  async findAll(): Promise<appointments[]> {
    return await this.prisma.appointments.findMany();
  }

  async findAwaiting(): Promise<appointments[]> {
    const appointment = 'waiting';

    return await this.prisma.appointments.findMany({ where: { appointment } });
  }


  async findOne(id: number): Promise<appointments> {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    file?: Express.Multer.File,
  ): Promise<appointments> {
    await this.findOne(id);

    let photoUrl: string | null = null;

    if (file) {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

      const fileName = `appointments/${randomName}${extname(file.originalname)}`;
      photoUrl = await this.storageService.uploadFile(file, fileName);
    }

    return await this.prisma.appointments.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        ...(photoUrl && { appointmentPicture: photoUrl }),
      },
    });
  }

  async remove(id: number): Promise<appointments> {
    await this.findOne(id);

    return await this.prisma.appointments.delete({ where: { id } });
  }

  async updateProfilePic(appointmentId: number, file: Express.Multer.File): Promise<appointments> {
    await this.findOne(appointmentId);

    const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    const fileName = `appointment/${appointmentId}/${randomName}${extname(file.originalname)}`;

    const publicUrl = await this.storageService.uploadFile(file, fileName);

    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { appointmentPicture: publicUrl }
    })
  }
}
