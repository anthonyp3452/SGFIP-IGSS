import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { Informe } from './informe.entity';

/** Ancho del bloque numérico (ej. INF-2026-0001 → 4). */
const CORRELATIVO_ANCHO = 4;

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reserva el siguiente correlativo para el año dado de forma atómica.
   * PostgreSQL serializa los conflictos en la fila del año; no hay duplicados bajo concurrencia.
   */
  private async reservarSiguienteNumero(
    manager: EntityManager,
    anio: number,
  ): Promise<number> {
    const rows = await manager.query<
      { ultimo_numero: string | number }[]
    >(
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

  /**
   * Crea el registro de informe: correlativo único (`INF-AAAA-NNNN`, atómico en BD),
   * estado "Pendiente", `inspectorId` del JWT y `createdAt` al persistir.
   */
  async solicitar(inspectorId: number, dto: SolicitarInformeDto): Promise<Informe> {
    const anio = new Date().getUTCFullYear();

    return this.dataSource.transaction(async (manager) => {
      const secuencia = await this.reservarSiguienteNumero(manager, anio);
      const numeroInforme = this.formatearNumeroInforme(anio, secuencia);

      const informe = manager.create(Informe, {
        numeroInforme,
        inspectorId,
        nombrePatrono: dto.nombrePatrono,
        nitPatrono: dto.nitPatrono,
        direccionPatrono: dto.direccionPatrono,
        estado: 'Pendiente',
      });

      return manager.save(Informe, informe);
    });
  }

  findAll(): Promise<Informe[]> {
    return this.informesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
