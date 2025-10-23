import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
/*import { Express } from 'express'; */
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    // Pega as variáveis do .env
    const region = this.configService.get<string>('B2_REGION');
    const endpoint = this.configService.get<string>('B2_ENDPOINT');
    const bucketName = this.configService.get<string>('B2_BUCKET_NAME');
    const accessKeyId = this.configService.get<string>('B2_APPLICATION_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('B2_APPLICATION_KEY');

    // Verifica se todas as variáveis necessárias existem
    if (
      !region ||
      !endpoint ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new InternalServerErrorException(
        'Storage environment variables are not configured correctly.',
      );
    }

    // Após a verificação, o TypeScript sabe que os valores são 'string'
    // e permite a atribuição sem erros.
    this.endpoint = endpoint;
    this.bucketName = bucketName;

    // A criação do S3Client também funcionará sem erros de tipo.
    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    destination: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: destination,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      const endpointDomain = this.endpoint.replace('https://', '');
      const publicUrl = `https://${this.bucketName}.${endpointDomain}/${destination}`;
      return publicUrl;
    } catch (error) {
      throw new Error(`Failed to upload file to B2: ${error}`);
    }
  }
}
