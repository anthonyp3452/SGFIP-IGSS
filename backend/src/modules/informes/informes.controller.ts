import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  solicitar(
    @Req() req: Request,
    @Body() dto: SolicitarInformeDto,
  ) {
    const usuarioId = (req.user as { usuario_id: number }).usuario_id;
    return this.informesService.solicitar(usuarioId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.informesService.findAll();
  }
}
