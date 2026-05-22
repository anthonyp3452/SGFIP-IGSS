import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DevolverInformeDto } from './dto/devolver-informe.dto';
import { FiltrarInformesDto } from './dto/filtrar-informes.dto';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  crear(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: SolicitarInformeDto,
  ) {
    const solicitanteId = req.user.usuario_id;
    const rolId = req.user.rol_id;
    return this.informesService.solicitar(solicitanteId, rolId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.informesService.findAll();
  }

  @Get('mis-informes')
  @UseGuards(JwtAuthGuard)
  misInformes(
    @Req() req: Request & { user: JwtPayload },
    @Query() filtros: FiltrarInformesDto,
  ) {
    const inspectorId = req.user.usuario_id;
    return this.informesService.findByInspector(inspectorId, filtros.estado);
  }

  @Get('en-revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  informesEnRevision() {
    return this.informesService.findEnRevision();
  }

  @Patch(':id/iniciar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  iniciarProceso(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.informesService.iniciarProceso(id, req.user.usuario_id);
  }

  @Patch(':id/enviar-revision')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  enviarARevision(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.informesService.enviarARevision(id, req.user.usuario_id);
  }

  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  aprobar(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.informesService.aprobar(id, req.user.usuario_id);
  }

  @Patch(':id/devolver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  devolver(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DevolverInformeDto,
  ) {
    return this.informesService.devolver(
      id,
      req.user.usuario_id,
      dto.observacion,
    );
  }
}
