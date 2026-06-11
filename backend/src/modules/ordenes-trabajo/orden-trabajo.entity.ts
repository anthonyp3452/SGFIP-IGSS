import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'ordenes_trabajo' })
export class OrdenTrabajo {
  @PrimaryGeneratedColumn({ name: 'orden_id', type: 'integer' })
  ordenId: number;

  @Column({ name: 'codigo_orden', type: 'varchar', length: 20, unique: true })
  codigoOrden: string;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'numero_patronal', type: 'varchar', length: 100 })
  numeroPatronal: string;

  @Column({ name: 'nombre_patrono', type: 'varchar', length: 255 })
  nombrePatrono: string;

  @Column({ name: 'empresa', type: 'varchar', length: 255, nullable: true })
  empresa?: string;

  @Column({ name: 'numero_afiliado', type: 'varchar', length: 100, nullable: true })
  numeroAfiliado?: string;

  @Column({ name: 'nombre_afiliado', type: 'varchar', length: 255, nullable: true })
  nombreAfiliado?: string;

  @Column({ name: 'dependencia_solicitante', type: 'varchar', length: 255, nullable: true })
  dependenciaSolicitante?: string;

  @Column({ name: 'fecha_ingreso', type: 'date', nullable: true })
  fechaIngreso?: string;

  @Column({ name: 'documentos_soporte', type: 'text', nullable: true })
  documentoSoporte?: string;

  @Column({ name: 'inspector_id', type: 'integer' })
  inspectorId: number;

  @Column({ name: 'supervisor_id', type: 'integer' })
  supervisorId: number;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'Pendiente' })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', precision: 3 })
  updatedAt: Date;
}
