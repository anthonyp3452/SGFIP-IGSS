import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** Valores permitidos alineados con la interfaz de solicitud (inspección patronal). */
export const TIPOS_INSPECCION_VALIDOS = [
  'Regular',
  'Sorpresiva',
  'Seguimiento',
  'Reinspección',
  'Consulta técnica',
] as const;

export class SolicitarInformeDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([...TIPOS_INSPECCION_VALIDOS], {
    message: 'tipoInspeccion debe ser un tipo de inspección válido',
  })
  tipoInspeccion: string;

  @IsString()
  @IsNotEmpty()
  nombrePatrono: string;

  @IsString()
  @IsNotEmpty()
  nitPatrono: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccionPatrono?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  inspectorId?: number;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;
}
