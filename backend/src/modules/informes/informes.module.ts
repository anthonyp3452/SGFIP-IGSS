import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrdenesTrabajoModule } from '../ordenes-trabajo/ordenes-trabajo.module';
import { ActaSecuencia } from './acta-secuencia.entity';
import { AuditoriaInforme } from './auditoria-informe.entity';
import { InformeAnulado } from './informe-anulado.entity';
import { InformeSecuencia } from './informe-secuencia.entity';
import { Informe } from './informe.entity';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Informe,
      InformeSecuencia,
      AuditoriaInforme,
      InformeAnulado,
      ActaSecuencia,
    ]),
    AuthModule,
    OrdenesTrabajoModule,
  ],
  controllers: [InformesController],
  providers: [InformesService],
  exports: [InformesService],
})
export class InformesModule {}
