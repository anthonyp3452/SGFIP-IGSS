import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ESTADOS_VALIDOS } from '../const/informe-estados';

export const URGENCIAS = ['Baja', 'Media', 'Alta'] as const;
export type Urgencia = (typeof URGENCIAS)[number];
export const TIPOS_DOCUMENTO = ['informe', 'acta'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export class FiltrarInformesDto {
  @IsOptional()
  @IsIn(ESTADOS_VALIDOS, { message: 'Estado no válido' })
  estado?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  inspectorId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  supervisorId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsIn(URGENCIAS, { message: 'Urgencia no válida' })
  urgencia?: Urgencia;

  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO, { message: 'Tipo no válido' })
  tipo?: TipoDocumento;
}
