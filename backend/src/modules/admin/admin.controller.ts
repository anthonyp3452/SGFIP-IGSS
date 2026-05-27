import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsArray, IsInt, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { Transform } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditoriaInforme } from '../informes/auditoria-informe.entity';
import { Informe } from '../informes/informe.entity';
import { InformeAnulado } from '../informes/informe-anulado.entity';
import { InformeSecuencia } from '../informes/informe-secuencia.entity';

class AnularNumerosDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  anio: number;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  numeros: number[];
}

class ReiniciarContadorDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  anio: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number(value))
  ultimoNumero: number;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
export class AdminController {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
    @InjectRepository(AuditoriaInforme)
    private readonly auditoriaRepository: Repository<AuditoriaInforme>,
    @InjectRepository(InformeSecuencia)
    private readonly secuenciaRepository: Repository<InformeSecuencia>,
    @InjectRepository(InformeAnulado)
    private readonly anuladosRepository: Repository<InformeAnulado>,
  ) {}

  @Get('tiempos/inspectores')
  async tiemposInspectores() {
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        i.inspector_id,
        u.nombre AS inspector_nombre,
        COUNT(i.informe_id) AS total_informes,
        AVG(
          EXTRACT(EPOCH FROM (i.finalizado_at - i.iniciado_at)) / 86400.0
        ) AS dias_promedio,
        SUM(
          EXTRACT(EPOCH FROM (i.finalizado_at - i.iniciado_at)) / 86400.0
        ) AS dias_total
      FROM informes i
      LEFT JOIN usuarios u ON u.usuario_id = i.inspector_id
      WHERE i.estado = 'Finalizado'
        AND i.iniciado_at IS NOT NULL
        AND i.finalizado_at IS NOT NULL
      GROUP BY i.inspector_id, u.nombre
      ORDER BY dias_promedio DESC`,
    );
    return raw;
  }

  @Get('tiempos/supervisores')
  async tiemposSupervisores() {
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        i.supervisor_id,
        u.nombre AS supervisor_nombre,
        COUNT(i.informe_id) AS total_aprobados,
        AVG(
          EXTRACT(EPOCH FROM (i.finalizado_at - i.enviado_revision_at)) / 86400.0
        ) AS dias_promedio_revision,
        SUM(
          EXTRACT(EPOCH FROM (i.finalizado_at - i.enviado_revision_at)) / 86400.0
        ) AS dias_total_revision
      FROM informes i
      LEFT JOIN usuarios u ON u.usuario_id = i.supervisor_id
      WHERE i.estado = 'Finalizado'
        AND i.supervisor_id IS NOT NULL
        AND i.enviado_revision_at IS NOT NULL
        AND i.finalizado_at IS NOT NULL
      GROUP BY i.supervisor_id, u.nombre
      ORDER BY dias_promedio_revision DESC`,
    );
    return raw;
  }

  @Get('secuencia')
  async verSecuencia() {
    return this.secuenciaRepository.find({ order: { anio: 'DESC' } });
  }

  @Post('secuencia/anular')
  @HttpCode(HttpStatus.OK)
  async anularNumeros(@Body() dto: AnularNumerosDto) {
    const existentes = await this.informesRepository.count({
      where: dto.numeros.map((n) => ({
        numeroInforme: `INF-${dto.anio}-${String(n).padStart(4, '0')}`,
      })),
    });
    if (existentes > 0) {
      return {
        message: `No se pueden anular: ${existentes} número(s) ya están asignados a informes existentes.`,
      };
    }
    const registros = dto.numeros.map((n) =>
      this.anuladosRepository.create({ anio: dto.anio, numero: n }),
    );
    await this.anuladosRepository.save(registros);
    return {
      message: `${dto.numeros.length} número(s) anulado(s) correctamente.`,
    };
  }

  @Post('secuencia/reiniciar')
  @HttpCode(HttpStatus.OK)
  async reiniciarContador(@Body() dto: ReiniciarContadorDto) {
    await this.secuenciaRepository.upsert(
      { anio: dto.anio, ultimoNumero: dto.ultimoNumero },
      ['anio'],
    );
    return {
      message: `Contador del año ${dto.anio} reiniciado a ${dto.ultimoNumero}.`,
    };
  }

  @Get('auditoria')
  async auditoria(
    @Query('informeId') informeId?: string,
    @Query('limit') limit?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (informeId) where.informeId = Number(informeId);
    return this.auditoriaRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit ? Math.min(Number(limit), 500) : 100,
    });
  }

  @Get('auditoria/:id')
  async auditoriaPorInforme(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaRepository.find({
      where: { informeId: id },
      order: { createdAt: 'DESC' },
    });
  }

  @Get('tiempos/general')
  async tiemposGenerales() {
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        COUNT(*) AS total_finalizados,
        AVG(
          EXTRACT(EPOCH FROM (finalizado_at - iniciado_at)) / 86400.0
        ) AS dias_promedio_global,
        AVG(
          EXTRACT(EPOCH FROM (finalizado_at - enviado_revision_at)) / 86400.0
        ) AS dias_promedio_revision
      FROM informes
      WHERE estado = 'Finalizado'
        AND iniciado_at IS NOT NULL
        AND finalizado_at IS NOT NULL`,
    );
    return raw;
  }
}
