import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'informe_anulados' })
export class InformeAnulado {
  @PrimaryColumn({ name: 'anio', type: 'int' })
  anio: number;

  @PrimaryColumn({ name: 'numero', type: 'int' })
  numero: number;
}
