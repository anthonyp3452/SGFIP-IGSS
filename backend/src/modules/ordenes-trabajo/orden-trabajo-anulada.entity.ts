import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'orden_trabajo_anuladas' })
export class OrdenTrabajoAnulada {
  @PrimaryColumn({ name: 'anio', type: 'integer' })
  anio: number;

  @PrimaryColumn({ name: 'numero', type: 'integer' })
  numero: number;
}
