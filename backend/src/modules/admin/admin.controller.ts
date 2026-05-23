import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Informe } from '../informes/informe.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
export class AdminController {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
  ) {}

  @Get('tiempos/inspectores')
  async tiemposInspectores() {
    const raw = await this.informesRepository.query(
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
    const raw = await this.informesRepository.query(
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

  @Get('tiempos/general')
  async tiemposGenerales() {
    const raw = await this.informesRepository.query(
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
