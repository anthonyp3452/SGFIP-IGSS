import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'acta_secuencia' })
export class ActaSecuencia {
  @PrimaryColumn({ name: 'anio', type: 'integer' })
  anio: number;

  @Column({ name: 'ultimo_correlativo', type: 'integer' })
  ultimoCorrelativo: number;
}
