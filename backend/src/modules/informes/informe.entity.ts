import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'informes' })
export class Informe {
  @PrimaryGeneratedColumn({ name: 'informe_id', type: 'integer' })
  informeId: number;

  @Column({ name: 'numero_informe', type: 'varchar', unique: true })
  numeroInforme: string;

  @Column({ name: 'inspector_id', type: 'integer' })
  inspectorId: number;

  @Column({
    name: 'tipo_inspeccion',
    type: 'varchar',
    length: 80,
    default: 'Regular',
  })
  tipoInspeccion: string;

  @Column({ name: 'nombre_patrono', type: 'varchar' })
  nombrePatrono: string;

  @Column({ name: 'nit_patrono', type: 'varchar' })
  nitPatrono: string;

  @Column({ name: 'direccion_patrono', type: 'varchar', nullable: true })
  direccionPatrono?: string;

  @Column({ name: 'estado', type: 'varchar', default: 'Pendiente' })
  estado: string;

  /** Momento exacto de creación del registro (UTC en base de datos). */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', precision: 3 })
  updatedAt: Date;
}
