import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GenerarInvitacionDto } from './dto/generar-invitacion.dto';
import { InvitacionesService } from './invitaciones.service';

@Controller('invitaciones')
export class InvitacionesController {
  constructor(private readonly invitacionesService: InvitacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  generar(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: GenerarInvitacionDto,
  ) {
    return this.invitacionesService.generar(dto.rolId, req.user.usuario_id, dto.supervisorId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  listar() {
    return this.invitacionesService.listar();
  }
}
