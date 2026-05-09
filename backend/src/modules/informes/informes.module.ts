import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Informe } from './informe.entity';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Informe]), AuthModule],
  controllers: [InformesController],
  providers: [InformesService],
  exports: [InformesService],
})
export class InformesModule {}
