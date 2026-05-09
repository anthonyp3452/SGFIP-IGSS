import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseConfig } from './config/database.config';
import envConfiguration from './config/env.configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { InformesModule } from './modules/informes/informes.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
      envFilePath: '.env',
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildDatabaseConfig(
          {
            host: configService.get<string>('database.host', 'localhost'),
            port: configService.get<number>('database.port', 5432),
            username: configService.get<string>('database.username', 'postgres'),
            password: configService.get<string>('database.password', ''),
            name: configService.get<string>('database.name', 'sgfip'),
          },
          configService.get<string>('app.env', 'development'),
        ),
    }),
    AuthModule,
    HealthModule,
    InformesModule,
    UsuariosModule,
  ],
})
export class AppModule {}
