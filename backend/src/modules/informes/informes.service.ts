import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Between, DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { AuditoriaInforme } from './auditoria-informe.entity';
import { InformeAnulado } from './informe-anulado.entity';
import { ESTADO, TRANSICIONES } from './const/informe-estados';
import type { EstadoInforme } from './const/informe-estados';
import { AprobarInformeDto } from './dto/aprobar-informe.dto';
import { EnviarRevisionDto } from './dto/enviar-revision.dto';
import { FiltrarInformesDto } from './dto/filtrar-informes.dto';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { Informe } from './informe.entity';

const CORRELATIVO_ANCHO = 4;

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
    @InjectRepository(AuditoriaInforme)
    private readonly auditoriaRepository: Repository<AuditoriaInforme>,
    @InjectRepository(InformeAnulado)
    private readonly anuladosRepository: Repository<InformeAnulado>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async reservarSiguienteNumero(
    manager: EntityManager,
    anio: number,
  ): Promise<number> {
    const maxIter = 1000;
    for (let i = 0; i < maxIter; i++) {
      const rows = await manager.query<{ ultimo_numero: string | number }[]>(
        `INSERT INTO informe_secuencia (anio, ultimo_numero)
         VALUES ($1, 1)
         ON CONFLICT (anio) DO UPDATE
         SET ultimo_numero = informe_secuencia.ultimo_numero + 1
         RETURNING ultimo_numero`,
        [anio],
      );
      const raw = rows[0]?.ultimo_numero;
      const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
      if (!Number.isFinite(n) || n < 1) {
        throw new InternalServerErrorException(
          'No se pudo obtener el correlativo del informe',
        );
      }
      const anulado = await manager.findOne(InformeAnulado, {
        where: { anio, numero: n },
      });
      if (!anulado) return n;
    }
    throw new InternalServerErrorException(
      'No se encontró un número de informe disponible después de varios intentos',
    );
  }

  private formatearNumeroInforme(anio: number, secuencia: number): string {
    const sufijo = String(secuencia).padStart(CORRELATIVO_ANCHO, '0');
    return `INF-${anio}-${sufijo}`;
  }

  async solicitar(
    solicitanteId: number,
    rolId: number,
    dto: SolicitarInformeDto,
  ): Promise<Informe> {
    const anio = new Date().getUTCFullYear();
    const inspectorAsignado =
      rolId === 1 && dto.inspectorId ? dto.inspectorId : solicitanteId;

    return this.dataSource.transaction(async (manager) => {
      const secuencia = await this.reservarSiguienteNumero(manager, anio);
      const numeroInforme = this.formatearNumeroInforme(anio, secuencia);

      const informe = manager.create(Informe, {
        numeroInforme,
        inspectorId: inspectorAsignado,
        estado: ESTADO.PENDIENTE,
      });

      const saved = await manager.save(Informe, informe);

      await manager.insert(AuditoriaInforme, {
        informeId: saved.informeId,
        numeroInforme: saved.numeroInforme,
        usuarioId: solicitanteId,
        accion: 'creacion',
        estadoNuevo: ESTADO.PENDIENTE,
      });

      return saved;
    });
  }

  async findAll(filtros?: FiltrarInformesDto): Promise<Informe[]> {
    const where: FindOptionsWhere<Informe> = {};

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

    if (filtros?.urgencia) {
      const now = Date.now();
      const dias = { Baja: 2, Media: 5, Alta: 6 } as const;
      const limite = dias[filtros.urgencia];
      if (filtros.urgencia === 'Alta') {
        where.createdAt = Between(
          new Date('1900-01-01'),
          new Date(now - limite * 86400000),
        );
      } else if (filtros.urgencia === 'Media') {
        where.createdAt = Between(
          new Date(now - 5 * 86400000),
          new Date(now - 2 * 86400000),
        );
      } else {
        where.createdAt = Between(
          new Date(now - 2 * 86400000),
          new Date(now + 86400000),
        );
      }
    }

    const informes = await this.informesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return informes;
  }

  async findById(id: number): Promise<Informe> {
    const informe = await this.informesRepository.findOne({
      where: { informeId: id },
    });
    if (!informe) {
      throw new NotFoundException(`Informe #${id} no encontrado`);
    }
    return informe;
  }

  findByInspector(inspectorId: number, estado?: string): Promise<Informe[]> {
    const where: Record<string, unknown> = { inspectorId };
    if (estado) where.estado = estado;
    return this.informesRepository.find({
      where: where,
      order: { createdAt: 'DESC' },
    });
  }

  findEnRevision(): Promise<Informe[]> {
    return this.informesRepository.find({
      where: { estado: ESTADO.EN_REVISION },
      order: { createdAt: 'DESC' },
    });
  }

  private async registrarAuditoria(params: {
    informe: Informe;
    usuarioId?: number;
    accion: string;
    estadoAnterior?: string;
    estadoNuevo?: string;
    detalle?: string;
  }) {
    await this.auditoriaRepository.insert({
      informeId: params.informe.informeId,
      numeroInforme: params.informe.numeroInforme,
      usuarioId: params.usuarioId,
      accion: params.accion,
      estadoAnterior: params.estadoAnterior,
      estadoNuevo: params.estadoNuevo,
      detalle: params.detalle,
    });
  }

  private async transitarEstado(
    informeId: number,
    actorId: number,
    estadoDestino: EstadoInforme,
    esInspector: boolean,
    observacion?: string,
  ): Promise<Informe> {
    const informe = await this.findById(informeId);
    const estadoActual = informe.estado as EstadoInforme;
    const transicionesPermitidas = TRANSICIONES.get(estadoActual);

    if (
      !transicionesPermitidas ||
      !transicionesPermitidas.includes(estadoDestino)
    ) {
      throw new BadRequestException(
        `No se puede pasar de "${estadoActual}" a "${estadoDestino}"`,
      );
    }

    if (esInspector && informe.inspectorId !== actorId) {
      throw new ForbiddenException(
        'No puedes modificar un informe que no te pertenece',
      );
    }

    if (!esInspector && informe.inspectorId === actorId) {
      throw new ForbiddenException(
        'No puedes aprobar/devolver tu propio informe',
      );
    }

    informe.estado = estadoDestino;
    if (!esInspector) {
      informe.supervisorId = actorId;
    }
    if (observacion !== undefined) {
      informe.observacion = observacion;
    }
    if (
      estadoDestino === ESTADO.EN_PROCESO &&
      estadoActual === ESTADO.DEVUELTO
    ) {
      informe.observacion = undefined;
    }

    const saved = await this.informesRepository.save(informe);

    await this.registrarAuditoria({
      informe: saved,
      usuarioId: actorId,
      accion: `transicion: ${estadoActual} → ${estadoDestino}`,
      estadoAnterior: estadoActual,
      estadoNuevo: estadoDestino,
      detalle: observacion,
    });

    return saved;
  }

  async iniciarProceso(
    informeId: number,
    inspectorId: number,
  ): Promise<Informe> {
    const informe = await this.transitarEstado(
      informeId,
      inspectorId,
      ESTADO.EN_PROCESO,
      true,
    );
    if (!informe.iniciadoAt) {
      informe.iniciadoAt = new Date();
      await this.informesRepository.save(informe);
    }
    return informe;
  }

  async enviarARevision(
    informeId: number,
    inspectorId: number,
    dto: EnviarRevisionDto,
  ): Promise<Informe> {
    const informe = await this.transitarEstado(
      informeId,
      inspectorId,
      ESTADO.EN_REVISION,
      true,
    );
    informe.fechaInforme = dto.fechaInforme;
    informe.descripcion = dto.descripcion;
    informe.noAfiliacionRiesgo = dto.noAfiliacionRiesgo;
    informe.nombrePatrono = dto.nombrePatrono;
    informe.nitPatrono = dto.nitPatrono;
    informe.direccionPatrono = dto.direccionPatrono;
    informe.enviadoRevisionAt = new Date();
    return this.informesRepository.save(informe);
  }

  async aprobar(
    informeId: number,
    supervisorId: number,
    dto: AprobarInformeDto,
  ): Promise<Informe> {
    const informe = await this.transitarEstado(
      informeId,
      supervisorId,
      ESTADO.FINALIZADO,
      false,
    );
    informe.noOficio = dto.noOficio;
    informe.fechaOficio = dto.fechaOficio;
    informe.envio = dto.envio;
    informe.finalizadoAt = new Date();
    return this.informesRepository.save(informe);
  }

  async devolver(
    informeId: number,
    supervisorId: number,
    observacion: string,
  ): Promise<Informe> {
    return this.transitarEstado(
      informeId,
      supervisorId,
      ESTADO.DEVUELTO,
      false,
      observacion,
    );
  }
}
