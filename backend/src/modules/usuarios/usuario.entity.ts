import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'rol_id', type: 'integer' })
  rolId: number;

  @Column({ name: 'supervisor_id', type: 'integer', nullable: true })
  supervisorId?: number;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash?: string;

  @Column({ name: 'activo', type: 'boolean' })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
