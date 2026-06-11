import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'orden_trabajo_secuencia' })
export class OrdenTrabajoSecuencia {
  @PrimaryColumn({ name: 'anio', type: 'integer' })
  anio: number;

  @Column({ name: 'ultimo_correlativo', type: 'integer' })
  ultimoCorrelativo: number;
}
