import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Invitacion } from './invitacion.entity';
import { InvitacionesController } from './invitaciones.controller';
import { InvitacionesService } from './invitaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invitacion]), forwardRef(() => AuthModule)],
  controllers: [InvitacionesController],
  providers: [InvitacionesService],
  exports: [InvitacionesService],
})
export class InvitacionesModule {}
