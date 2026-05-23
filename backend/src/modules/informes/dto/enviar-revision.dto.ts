import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class EnviarRevisionDto {
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha del informe es requerida' })
  fechaInforme: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  descripcion: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de afiliación y riesgo es requerido' })
  @MaxLength(100)
  noAfiliacionRiesgo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del patrono es requerido' })
  nombrePatrono: string;

  @IsString()
  @IsNotEmpty({ message: 'El NIT del patrono es requerido' })
  nitPatrono: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccionPatrono?: string;
}
