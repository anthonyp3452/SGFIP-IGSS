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

  @Get('dashboard/resumen')
  async dashboardResumen() {
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        (SELECT COUNT(*) FROM informes) AS total,
        (SELECT COUNT(*) FROM informes WHERE estado = 'Pendiente') AS pendientes,
        (SELECT COUNT(*) FROM informes WHERE estado IN ('En Proceso','En Revisión')) AS en_curso,
        (SELECT COUNT(*) FROM informes WHERE estado = 'Devuelto') AS devueltos,
        (SELECT COUNT(*) FROM informes WHERE estado = 'Finalizado') AS finalizados,
        (SELECT COUNT(*) FROM informes WHERE estado = 'Anulado') AS anulados,
        (SELECT COUNT(*) FROM informes
          WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
        ) AS del_mes,
        COALESCE(
          (SELECT SUM(EXTRACT(EPOCH FROM (finalizado_at - iniciado_at)) / 86400.0) /
                  NULLIF(COUNT(*), 0)
           FROM informes
           WHERE estado = 'Finalizado' AND iniciado_at IS NOT NULL AND finalizado_at IS NOT NULL),
          0
        ) AS promedio_dias
      `,
    );
    return raw[0] || {};
  }

  @Get('dashboard/distribucion')
  async dashboardDistribucion() {
    return this.informesRepository.query(
      `SELECT estado, COUNT(*)::int AS count
       FROM informes
       GROUP BY estado
       ORDER BY count DESC`,
    );
  }

  @Get('dashboard/tendencia')
  async dashboardTendencia(@Query('meses') meses?: string) {
    const limite = meses ? Math.min(Math.max(parseInt(meses, 10) || 12, 1), 36) : 12;
    return this.informesRepository.query(
      `SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS mes,
        COUNT(*)::int AS creados,
        COUNT(*) FILTER (WHERE estado = 'Finalizado')::int AS finalizados
      FROM informes
      WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '${limite} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY mes`,
    );
  }

  private buildDateClause(desde?: string, hasta?: string): string {
    const parts: string[] = [];
    if (desde && /^\d{4}-\d{2}-\d{2}$/.test(desde)) {
      parts.push(`i.created_at >= '${desde}'::date`);
    }
    if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
      parts.push(`i.created_at < ('${hasta}'::date + INTERVAL '1 day')`);
    }
    return parts.length > 0 ? ' AND ' + parts.join(' AND ') : '';
  }

  @Get('tiempos/inspectores')
  async tiemposInspectores(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const dateClause = this.buildDateClause(desde, hasta);
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        i.inspector_id,
        u.nombre AS inspector_nombre,
        COUNT(*)::int AS total_asignados,
        COUNT(*) FILTER (WHERE i.estado = 'Pendiente')::int AS pendientes,
        COUNT(*) FILTER (WHERE i.estado = 'En Proceso')::int AS en_proceso,
        COUNT(*) FILTER (WHERE i.estado = 'Devuelto')::int AS devueltos,
        COUNT(*) FILTER (WHERE i.estado = 'En Revisi\u00f3n')::int AS en_revision,
        COUNT(*) FILTER (WHERE i.estado = 'Finalizado')::int AS finalizados,
        COUNT(*) FILTER (WHERE i.estado = 'Anulado')::int AS anulados,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (i.finalizado_at - i.iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_promedio,
        ROUND(
          MAX(EXTRACT(EPOCH FROM (i.finalizado_at - i.iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_maximo,
        ROUND(
          MIN(EXTRACT(EPOCH FROM (i.finalizado_at - i.iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_minimo,
        CASE WHEN COUNT(*) FILTER (WHERE i.estado IN ('Finalizado','Devuelto')) > 0 THEN
          ROUND(
            COUNT(*) FILTER (WHERE i.estado = 'Devuelto')::numeric /
            NULLIF(COUNT(*) FILTER (WHERE i.estado IN ('Finalizado','Devuelto')), 0) * 100, 1
          )
        ELSE 0 END AS tasa_devolucion
      FROM informes i
      LEFT JOIN usuarios u ON u.usuario_id = i.inspector_id
      WHERE u.rol_id = 2${dateClause}
      GROUP BY i.inspector_id, u.nombre
      ORDER BY total_asignados DESC`,
    );
    return raw;
  }

  @Get('tiempos/supervisores')
  async tiemposSupervisores(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const dateClause = this.buildDateClause(desde, hasta);
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        i.supervisor_id,
        u.nombre AS supervisor_nombre,
        COUNT(*)::int AS total_revisados,
        COUNT(*) FILTER (WHERE i.estado = 'Finalizado')::int AS aprobados,
        COUNT(*) FILTER (WHERE i.estado = 'Devuelto')::int AS devueltos,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (i.finalizado_at - i.enviado_revision_at)) / 86400.0)::numeric, 1
        ) AS dias_promedio,
        ROUND(
          MAX(EXTRACT(EPOCH FROM (i.finalizado_at - i.enviado_revision_at)) / 86400.0)::numeric, 1
        ) AS dias_maximo,
        ROUND(
          MIN(EXTRACT(EPOCH FROM (i.finalizado_at - i.enviado_revision_at)) / 86400.0)::numeric, 1
        ) AS dias_minimo,
        CASE WHEN COUNT(*) > 0 THEN
          ROUND(
            COUNT(*) FILTER (WHERE i.estado = 'Finalizado')::numeric / COUNT(*) * 100, 1
          )
        ELSE 0 END AS tasa_aprobacion
      FROM informes i
      LEFT JOIN usuarios u ON u.usuario_id = i.supervisor_id
      WHERE i.supervisor_id IS NOT NULL
        AND i.estado IN ('Finalizado','Devuelto')${dateClause}
      GROUP BY i.supervisor_id, u.nombre
      ORDER BY total_revisados DESC`,
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
  async tiemposGenerales(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const dateClause = this.buildDateClause(desde, hasta);
    const whereClause = dateClause ? ' WHERE 1=1' + dateClause : '';
    const raw: Record<string, unknown>[] = await this.informesRepository.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE estado = 'Pendiente')::int AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'En Proceso')::int AS en_proceso,
        COUNT(*) FILTER (WHERE estado = 'Devuelto')::int AS devueltos,
        COUNT(*) FILTER (WHERE estado = 'En Revisi\u00f3n')::int AS en_revision,
        COUNT(*) FILTER (WHERE estado = 'Finalizado')::int AS finalizados,
        COUNT(*) FILTER (WHERE estado = 'Anulado')::int AS anulados,
        ROUND(
          CASE WHEN COUNT(*) > 0 THEN
            COUNT(*) FILTER (WHERE estado = 'Finalizado')::numeric / COUNT(*) * 100
          ELSE 0 END, 1
        ) AS tasa_finalizacion,
        ROUND(
          CASE WHEN COUNT(*) FILTER (WHERE estado IN ('Finalizado','Devuelto')) > 0 THEN
            COUNT(*) FILTER (WHERE estado = 'Devuelto')::numeric /
            NULLIF(COUNT(*) FILTER (WHERE estado IN ('Finalizado','Devuelto')), 0) * 100
          ELSE 0 END, 1
        ) AS tasa_devolucion,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (finalizado_at - iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_promedio_global,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (finalizado_at - enviado_revision_at)) / 86400.0)::numeric, 1
        ) AS dias_promedio_revision,
        ROUND(
          MAX(EXTRACT(EPOCH FROM (finalizado_at - iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_maximo_global,
        ROUND(
          MIN(EXTRACT(EPOCH FROM (finalizado_at - iniciado_at)) / 86400.0)::numeric, 1
        ) AS dias_minimo_global
      FROM informes${whereClause}`,
    );
    return raw;
  }
}
