import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { OrdenTrabajoAnulada } from './orden-trabajo-anulada.entity';
import { OrdenTrabajoSecuencia } from './orden-trabajo-secuencia.entity';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenTrabajo,
      OrdenTrabajoSecuencia,
      OrdenTrabajoAnulada,
    ]),
    AuthModule,
  ],
  controllers: [OrdenesTrabajoController],
  providers: [OrdenesTrabajoService],
  exports: [OrdenesTrabajoService],
})
export class OrdenesTrabajoModule {}
