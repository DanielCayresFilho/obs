import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsModule } from './clients.module';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { Clients, Prisma } from '@prisma/client';
import { extname } from 'path';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService, private storageService: StorageService) {}


  async create(createClientDto: CreateClientDto, file?: Express.Multer.File): Promise<Clients> {
  let photoUrl: string | null = null;

  if (file) {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');

    const fileName = `clients/${randomName}${extname(file.originalname)}`;
    photoUrl = await this.storageService.uploadFile(file, fileName);
  }

  return this.prisma.clients.create({
    data: {
      ...createClientDto,
      birthday: new Date(createClientDto.birthday),
      clientPicture: photoUrl, // só será preenchido se o arquivo for enviado
    },
  });
}


  async findAll(): Promise<Clients[]> {
    return this.prisma.clients.findMany()
  }

  async findBirthday(): Promise<Clients[]> {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const dia = hoje.getDate();

  const aniversariantes = await this.prisma.$queryRaw<Clients[]>(
    Prisma.sql`
      SELECT * FROM "Clients"
      WHERE EXTRACT(MONTH FROM "birthday") = ${mes}
      AND EXTRACT(DAY FROM "birthday") = ${dia}
    `
  );

  return aniversariantes;
}

  async findOne(id: number): Promise<Clients> {
    const client = await this.prisma.clients.findUnique({where: {id}
    })

    if(!client) {
      throw new NotFoundException('User not found');
    }

    return client
  }

  async update(
  id: number,
  updateClientDto: UpdateClientDto,
  file?: Express.Multer.File,
): Promise<Clients> {
  await this.findOne(id);

  if (updateClientDto.birthday) {
    updateClientDto.birthday = new Date(updateClientDto.birthday);
  }

  let photoUrl: string | null = null;

  if (file) {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');

    const fileName = `clients/${randomName}${extname(file.originalname)}`;
    photoUrl = await this.storageService.uploadFile(file, fileName);
  }

  return this.prisma.clients.update({
    where: { id },
    data: {
      ...updateClientDto,
      ...(photoUrl && { clientPicture: photoUrl }), // atualiza clientPicture só se enviou nova imagem
    },
  });
}


  async remove(id: number): Promise<Clients> {
    await this.findOne(id)

    return this.prisma.clients.delete({where: {id}})
  }

  async updateProfilePic(clientId: number, file: Express.Multer.File): Promise<Clients> {
      await this.findOne(clientId);
  
      const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
      const fileName = `clients/${clientId}/${randomName}${extname(file.originalname)}`;
      
      const publicUrl = await this.storageService.uploadFile(file, fileName);
  
      return this.prisma.clients.update({
        where: { id: clientId },
        data: { clientPicture: publicUrl }
    }) }

}
