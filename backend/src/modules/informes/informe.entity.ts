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

  @Column({ name: 'supervisor_id', type: 'integer', nullable: true })
  supervisorId?: number;

  @Column({ name: 'nombre_patrono', type: 'varchar', nullable: true })
  nombrePatrono?: string;

  @Column({ name: 'nit_patrono', type: 'varchar', nullable: true })
  nitPatrono?: string;

  @Column({ name: 'direccion_patrono', type: 'varchar', nullable: true })
  direccionPatrono?: string;

  @Column({ name: 'estado', type: 'varchar', default: 'Pendiente' })
  estado: string;

  @Column({
    name: 'observacion',
    type: 'varchar',
    nullable: true,
    length: 1000,
  })
  observacion?: string;

  @Column({ name: 'fecha_limite', type: 'timestamptz', nullable: true })
  fechaLimite?: Date;

  @Column({ name: 'fecha_informe', type: 'date', nullable: true })
  fechaInforme?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'no_afiliacion_riesgo', type: 'varchar', length: 100, nullable: true })
  noAfiliacionRiesgo?: string;

  @Column({ name: 'no_oficio', type: 'varchar', length: 100, nullable: true })
  noOficio?: string;

  @Column({ name: 'fecha_oficio', type: 'date', nullable: true })
  fechaOficio?: string;

  @Column({ name: 'envio', type: 'varchar', length: 500, nullable: true })
  envio?: string;

  @Column({ name: 'iniciado_at', type: 'timestamptz', nullable: true })
  iniciadoAt?: Date;

  @Column({ name: 'enviado_revision_at', type: 'timestamptz', nullable: true })
  enviadoRevisionAt?: Date;

  @Column({ name: 'finalizado_at', type: 'timestamptz', nullable: true })
  finalizadoAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', precision: 3 })
  updatedAt: Date;
}
