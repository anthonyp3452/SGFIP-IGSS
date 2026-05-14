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
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  /** Registro de nuevo informe (inspector desde JWT, estado Pendiente, fecha/hora en `createdAt`). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  crear(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: SolicitarInformeDto,
  ) {
    const inspectorId = req.user.usuario_id;
    return this.informesService.solicitar(inspectorId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.informesService.findAll();
  }
}
