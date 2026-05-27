import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditoriaInforme } from '../informes/auditoria-informe.entity';
import { InformeAnulado } from '../informes/informe-anulado.entity';
import { Informe } from '../informes/informe.entity';
import { InformeSecuencia } from '../informes/informe-secuencia.entity';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Informe,
      AuditoriaInforme,
      InformeSecuencia,
      InformeAnulado,
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
