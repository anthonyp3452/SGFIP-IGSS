import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const [helmetModule, rateLimitModule] = await Promise.all([
    import('helmet'),
    import('express-rate-limit'),
  ]);

  const helmet = helmetModule.default;
  const rateLimit = rateLimitModule.default;

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const frontendUrl = configService.get<string>(
    'app.frontendUrl',
    'http://localhost:3000',
  );
  const nodeEnv = configService.get<string>('app.env', 'development');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Seguridad: headers HTTP (XSS, content-type sniffing, clickjacking, etc.)
  app.use(helmet());

  // Rate limiting: máximo 20 solicitudes por IP cada 15 min en /api/auth
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Demasiadas solicitudes. Intente más tarde.',
      },
    }),
  );

  // Rate limiting global: 200 solicitudes/minuto
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Demasiadas solicitudes. Intente más tarde.',
      },
    }),
  );

  // CORS: solo el frontend autorizado en producción
  app.enableCors({
    origin: nodeEnv === 'production' ? frontendUrl : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(port);
}
void bootstrap();
