import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'invitaciones' })
export class Invitacion {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id: number;

  @Column({ name: 'codigo', type: 'varchar', length: 36, unique: true })
  codigo: string;

  @Column({ name: 'rol_id', type: 'integer' })
  rolId: number;

  @Column({ name: 'supervisor_id', type: 'integer', nullable: true })
  supervisorId?: number;

  @Column({ name: 'usado', type: 'boolean', default: false })
  usado: boolean;

  @Column({ name: 'creado_por', type: 'integer' })
  creadoPor: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date;
}
