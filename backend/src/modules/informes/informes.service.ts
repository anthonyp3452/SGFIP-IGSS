import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';
import { ESTADO, TRANSICIONES } from './const/informe-estados';
import type { EstadoInforme } from './const/informe-estados';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { Informe } from './informe.entity';

const CORRELATIVO_ANCHO = 4;

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async reservarSiguienteNumero(
    manager: EntityManager,
    anio: number,
  ): Promise<number> {
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
    return n;
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
    const fechaLimite = dto.fechaLimite
      ? new Date(dto.fechaLimite)
      : undefined;

    return this.dataSource.transaction(async (manager) => {
      const secuencia = await this.reservarSiguienteNumero(manager, anio);
      const numeroInforme = this.formatearNumeroInforme(anio, secuencia);

      const informe = manager.create(Informe, {
        numeroInforme,
        inspectorId: inspectorAsignado,
        tipoInspeccion: dto.tipoInspeccion,
        nombrePatrono: dto.nombrePatrono,
        nitPatrono: dto.nitPatrono,
        direccionPatrono: dto.direccionPatrono,
        estado: ESTADO.PENDIENTE,
        fechaLimite,
      });

      return manager.save(Informe, informe);
    });
  }

  findAll(): Promise<Informe[]> {
    return this.informesRepository.find({
      order: { createdAt: 'DESC' },
    });
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

    return this.informesRepository.save(informe);
  }

  async iniciarProceso(
    informeId: number,
    inspectorId: number,
  ): Promise<Informe> {
    return this.transitarEstado(
      informeId,
      inspectorId,
      ESTADO.EN_PROCESO,
      true,
    );
  }

  async enviarARevision(
    informeId: number,
    inspectorId: number,
  ): Promise<Informe> {
    return this.transitarEstado(
      informeId,
      inspectorId,
      ESTADO.EN_REVISION,
      true,
    );
  }

  async aprobar(informeId: number, supervisorId: number): Promise<Informe> {
    return this.transitarEstado(
      informeId,
      supervisorId,
      ESTADO.FINALIZADO,
      false,
    );
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
