import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere, Between } from 'typeorm';
import { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import { FiltrarOrdenesDto } from './dto/filtrar-ordenes.dto';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { OrdenTrabajoSecuencia } from './orden-trabajo-secuencia.entity';
import { OrdenTrabajoAnulada } from './orden-trabajo-anulada.entity';

const CORRELATIVO_ANCHO = 3;

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly ordenesRepository: Repository<OrdenTrabajo>,
    @InjectRepository(OrdenTrabajoSecuencia)
    private readonly secuenciaRepository: Repository<OrdenTrabajoSecuencia>,
    @InjectRepository(OrdenTrabajoAnulada)
    private readonly anuladasRepository: Repository<OrdenTrabajoAnulada>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async reservarSiguienteNumero(
    manager: any,
    anio: number,
  ): Promise<number> {
    const maxIter = 1000;
    for (let i = 0; i < maxIter; i++) {
      const rows = await manager.query(
        `INSERT INTO orden_trabajo_secuencia (anio, ultimo_correlativo)
         VALUES ($1, 1)
         ON CONFLICT (anio) DO UPDATE
         SET ultimo_correlativo = orden_trabajo_secuencia.ultimo_correlativo + 1
         RETURNING ultimo_correlativo`,
        [anio],
      ) as { ultimo_correlativo: string | number }[];
      const raw = rows[0]?.ultimo_correlativo;
      const n =
        typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
      if (!Number.isFinite(n) || n < 1) {
        throw new InternalServerErrorException(
          'No se pudo obtener el correlativo de la orden de trabajo',
        );
      }
      const anulada = await manager.findOne(OrdenTrabajoAnulada, {
        where: { anio, numero: n },
      });
      if (!anulada) return n;
    }
    throw new InternalServerErrorException(
      'No se encontró un número de orden disponible después de varios intentos',
    );
  }

  private formatearCodigo(anio: number, secuencia: number): string {
    const sufijo = String(secuencia).padStart(CORRELATIVO_ANCHO, '0');
    return `${sufijo}/${anio}`;
  }

  async crear(
    supervisorId: number,
    dto: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const anio = new Date().getUTCFullYear();

    return this.dataSource.transaction(async (manager) => {
      const secuencia = await this.reservarSiguienteNumero(manager, anio);
      const codigoOrden = this.formatearCodigo(anio, secuencia);

      const orden = manager.create(OrdenTrabajo, {
        codigoOrden,
        descripcion: dto.descripcion,
        numeroPatronal: dto.numeroPatronal,
        nombrePatrono: dto.nombrePatrono,
        empresa: dto.empresa,
        numeroAfiliado: dto.numeroAfiliado,
        nombreAfiliado: dto.nombreAfiliado,
        dependenciaSolicitante: dto.dependenciaSolicitante,
        fechaIngreso: dto.fechaIngreso,
        documentoSoporte: dto.documentoSoporte,
        inspectorId: dto.inspectorId,
        supervisorId,
        estado: 'Pendiente',
      });

      return manager.save(OrdenTrabajo, orden);
    });
  }

  async findAll(filtros?: FiltrarOrdenesDto): Promise<OrdenTrabajo[]> {
    const where: FindOptionsWhere<OrdenTrabajo> = {};

    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.inspectorId) where.inspectorId = filtros.inspectorId;
    if (filtros?.fechaInicio || filtros?.fechaFin) {
      where.createdAt = Between(
        filtros.fechaInicio
          ? new Date(filtros.fechaInicio)
          : new Date('1900-01-01'),
        filtros.fechaFin
          ? new Date(filtros.fechaFin + 'T23:59:59.999Z')
          : new Date('2100-01-01'),
      );
    }

    return this.ordenesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<OrdenTrabajo> {
    const orden = await this.ordenesRepository.findOne({
      where: { ordenId: id },
    });
    if (!orden) {
      throw new NotFoundException(`Orden de trabajo #${id} no encontrada`);
    }
    return orden;
  }

  async findByInspector(
    inspectorId: number,
    estado?: string,
  ): Promise<OrdenTrabajo[]> {
    const where: Record<string, unknown> = { inspectorId };
    if (estado) where.estado = estado;
    return this.ordenesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findBySupervisor(
    supervisorId: number,
    estado?: string,
  ): Promise<OrdenTrabajo[]> {
    const where: Record<string, unknown> = { supervisorId };
    if (estado) where.estado = estado;
    return this.ordenesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findPendientes(): Promise<OrdenTrabajo[]> {
    return this.ordenesRepository.find({
      where: { estado: 'Pendiente' },
      order: { createdAt: 'DESC' },
    });
  }

  async anular(
    ordenId: number,
    supervisorId: number,
  ): Promise<OrdenTrabajo> {
    const orden = await this.findById(ordenId);
    if (orden.estado !== 'Pendiente') {
      throw new BadRequestException(
        'Solo se pueden anular órdenes en estado Pendiente',
      );
    }
    orden.estado = 'Anulada';
    return this.ordenesRepository.save(orden);
  }

  async completar(ordenId: number): Promise<OrdenTrabajo> {
    const orden = await this.findById(ordenId);
    if (orden.estado !== 'Pendiente') {
      throw new BadRequestException(
        'La orden de trabajo no está en estado Pendiente',
      );
    }
    orden.estado = 'Completada';
    return this.ordenesRepository.save(orden);
  }
}
