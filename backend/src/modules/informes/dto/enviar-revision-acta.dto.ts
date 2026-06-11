import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class EnviarRevisionActaDto {
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha del acta es requerida' })
  fechaActa: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa/patrono es requerido' })
  nombrePatrono: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de inicio del período es requerida' })
  periodoDesde: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de fin del período es requerida' })
  periodoHasta: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'El monto revisado es requerido' })
  montoRevisado: number;
}
