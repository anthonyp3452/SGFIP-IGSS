import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Contador anual atómico para correlativos INF-AAAA-NNNN.
 * El incremento se hace con INSERT ... ON CONFLICT en SQL (sin condiciones de carrera).
 */
@Entity({ name: 'informe_secuencia' })
export class InformeSecuencia {
  @PrimaryColumn({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'ultimo_numero', type: 'int' })
  ultimoNumero: number;
}
