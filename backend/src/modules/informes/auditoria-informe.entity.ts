import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'auditoria_informes' })
export class AuditoriaInforme {
  @PrimaryGeneratedColumn({ name: 'auditoria_id', type: 'bigint' })
  auditoriaId: number;

  @Column({ name: 'informe_id', type: 'integer' })
  informeId: number;

  @Column({ name: 'numero_informe', type: 'varchar', length: 50 })
  numeroInforme: string;

  @Column({ name: 'usuario_id', type: 'integer', nullable: true })
  usuarioId?: number;

  @Column({ name: 'accion', type: 'varchar', length: 50 })
  accion: string;

  @Column({
    name: 'estado_anterior',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  estadoAnterior?: string;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 50, nullable: true })
  estadoNuevo?: string;

  @Column({ name: 'detalle', type: 'text', nullable: true })
  detalle?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;
}
