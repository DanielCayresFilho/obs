import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class StorageService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Diretório onde os arquivos serão salvos
    this.uploadsDir = join(process.cwd(), 'uploads');

    // URL base para acessar os arquivos
    const port = this.configService.get<string>('PORT') || '3000';
    this.baseUrl = `http://localhost:${port}/uploads`;

    // Cria o diretório de uploads se não existir
    this.ensureUploadsDirExists();
  }

  private async ensureUploadsDirExists() {
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    destination: string,
  ): Promise<string> {
    try {
      // Cria o caminho completo do arquivo
      const filePath = join(this.uploadsDir, destination);

      // Cria os subdiretórios se necessário (ex: uploads/users/, uploads/clients/)
      const directory = join(this.uploadsDir, destination.split('/')[0]);
      if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
      }

      // Salva o arquivo no sistema de arquivos local
      await writeFile(filePath, file.buffer);

      // Retorna a URL pública do arquivo
      const publicUrl = `${this.baseUrl}/${destination}`;
      return publicUrl;
    } catch (error) {
      throw new Error(`Failed to upload file locally: ${error}`);
    }
  }
}
