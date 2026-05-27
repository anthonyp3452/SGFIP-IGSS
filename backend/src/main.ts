import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

function validateEnv() {
  const requiredVars: { key: string; name: string }[] = [
    { key: 'JWT_SECRET', name: 'JWT_SECRET' },
    { key: 'DB_HOST', name: 'DB_HOST' },
    { key: 'DB_USER', name: 'DB_USER' },
    { key: 'DB_PASSWORD', name: 'DB_PASSWORD' },
    { key: 'DB_NAME', name: 'DB_NAME' },
  ];

  const missing = requiredVars.filter(
    (v) => !process.env[v.key] || process.env[v.key] === '',
  );

  if (missing.length > 0) {
    const list = missing.map((v) => `  - ${v.name}`).join('\n');
    console.error(
      `[SGFIP] Error crítico: variables de entorno requeridas no configuradas:\n${list}\n`,
    );
    process.exit(1);
  }

  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.FRONTEND_URL || process.env.FRONTEND_URL === '')
  ) {
    console.error(
      '[SGFIP] Error crítico: FRONTEND_URL es requerida en producción.\n',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  validateEnv();

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
