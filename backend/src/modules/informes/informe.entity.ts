import {
  AfterLoad,
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

  @Column({
    name: 'tipo_inspeccion',
    type: 'varchar',
    length: 80,
    default: 'Regular',
  })
  tipoInspeccion: string;

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

  @Column({
    name: 'no_afiliacion_riesgo',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
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

  nivelUrgencia?: string;

  private static readonly URGENCIA_BAJA = 'Baja';
  private static readonly URGENCIA_MEDIA = 'Media';
  private static readonly URGENCIA_ALTA = 'Alta';

  static calcularUrgencia(dias: number): string {
    if (dias >= 6) return this.URGENCIA_ALTA;
    if (dias >= 3) return this.URGENCIA_MEDIA;
    return this.URGENCIA_BAJA;
  }

  @AfterLoad()
  setNivelUrgencia() {
    if (this.createdAt) {
      const dias = (Date.now() - new Date(this.createdAt).getTime()) / 86400000;
      this.nivelUrgencia = Informe.calcularUrgencia(dias);
    }
  }
}
