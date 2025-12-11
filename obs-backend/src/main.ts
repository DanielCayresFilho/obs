import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Lê os origins permitidos do .env ou usa valores padrão
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173', // Dev local (fallback)
        'https://obscura.covenos.com.br', // Produção frontend (fallback)
      ];

  // Log para debug (remover em produção se necessário)
  console.log('CORS Allowed Origins:', allowedOrigins);

  // Configuração CORS com callback para permitir mais controle
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }
      
      // Verifica se o origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        console.log('CORS allowed origin:', origin);
        return callback(null, true);
      }
      
      // Log para debug
      console.log('CORS blocked origin:', origin, 'Allowed:', allowedOrigins);
      // Em desenvolvimento, podemos ser mais permissivos
      // Em produção, deve bloquear
      const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
      if (isDevelopment) {
        console.warn('CORS: Allowing origin in development mode:', origin);
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configuração para servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
