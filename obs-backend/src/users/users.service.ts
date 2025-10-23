import { extname } from 'path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { StorageService } from 'src/storage/storage.service';
import { Users } from '@prisma/client';

// =================================================================
// PASSO 1: DEFINIR OS TIPOS DE RETORNO SEGUROS AQUI
// =================================================================

// Tipo para a maioria dos retornos, SEM a senha.
export type SafeUser = Omit<Users, 'password'>;

// Tipo específico para o findByUser, que precisa da senha para autenticação.
export type UserForAuth = Pick<Users, 'id' | 'username' | 'password'>;

// =================================================================

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // Este método retorna o usuário completo, então Promise<Users> está correto.
  async create(data: CreateUserDto, file?: Express.Multer.File): Promise<Users> {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  let photoUrl: string | null = null;

  if (file) {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');

    const fileName = `users/${randomName}${extname(file.originalname)}`;
    photoUrl = await this.storageService.uploadFile(file, fileName);
  }

  return this.prisma.users.create({
    data: {
      ...data,
      password: hashedPassword,
      birthday: new Date(data.birthday),
      userPicture: photoUrl, // <--- Só vai ser preenchido se existir
    },
  });
}

  // CORREÇÃO: Usa o novo tipo SafeUser[]
  async findAll(): Promise<SafeUser[]> {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        birthday: true,
        userPicture: true,
        createdAt: true,
      },
    });
  }

  // CORREÇÃO: Usa o novo tipo SafeUser
  async findOne(id: number): Promise<SafeUser> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        birthday: true,
        userPicture: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // CORREÇÃO: Usa o tipo específico UserForAuth
  async findByUser(username: string): Promise<UserForAuth> {
    if (!username) {
      throw new BadRequestException('Invalid username');
    }
    const user = await this.prisma.users.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // CORREÇÃO: Usa o novo tipo SafeUser
  async update(data: UpdateUserDto, id: number): Promise<SafeUser> {
    await this.findOne(id);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.birthday) {
      data.birthday = new Date(data.birthday as any);
    }

    return this.prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        birthday: true,
        userPicture: true,
        createdAt: true,
      },
    });
  }

  // CORREÇÃO: Usa o novo tipo SafeUser
  async delete(id: number): Promise<SafeUser> {
    await this.findOne(id);

    return this.prisma.users.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        birthday: true,
        userPicture: true,
        createdAt: true,
      },
    });
  }

  // CORREÇÃO: Usa o novo tipo SafeUser
  async updateProfilePic(userId: number, file: Express.Multer.File): Promise<SafeUser> {
    await this.findOne(userId);

    const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    const fileName = `users/${userId}/${randomName}${extname(file.originalname)}`;
    
    const publicUrl = await this.storageService.uploadFile(file, fileName);

    return this.prisma.users.update({
      where: { id: userId },
      data: { userPicture: publicUrl },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        birthday: true,
        userPicture: true,
        createdAt: true,
      },
    });
  }
}