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
import { AnularInformeDto } from './dto/anular-informe.dto';
import { AprobarInformeDto } from './dto/aprobar-informe.dto';
import { DevolverInformeDto } from './dto/devolver-informe.dto';
import { EnviarRevisionDto } from './dto/enviar-revision.dto';
import { EnviarRevisionActaDto } from './dto/enviar-revision-acta.dto';
import { FiltrarInformesDto } from './dto/filtrar-informes.dto';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  crear(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: SolicitarInformeDto,
  ) {
    return this.informesService.solicitar(req.user.usuario_id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filtros: FiltrarInformesDto) {
    return this.informesService.findAll(filtros);
  }

  @Get('en-revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 3)
  informesEnRevision() {
    return this.informesService.findEnRevision();
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const informe = await this.informesService.findById(id);
    const auditoria = await this.informesService.findAuditoria(id);
    return { ...informe, auditoria };
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
    @Body() dto: EnviarRevisionDto,
  ) {
    return this.informesService.enviarARevision(id, req.user.usuario_id, dto);
  }

  @Patch(':id/enviar-revision-acta')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  enviarActaARevision(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarRevisionActaDto,
  ) {
    return this.informesService.enviarActaARevision(id, req.user.usuario_id, dto);
  }

  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  aprobar(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprobarInformeDto,
  ) {
    return this.informesService.aprobar(id, req.user.usuario_id, dto);
  }

  @Patch(':id/devolver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 3)
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

  @Patch(':id/anular')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  anular(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnularInformeDto,
  ) {
    return this.informesService.anular(
      id,
      req.user.usuario_id,
      dto.motivo,
    );
  }
}
