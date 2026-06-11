import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearOrdenTrabajoDto {
  @IsInt()
  @Min(1)
  inspectorId: number;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  descripcion: string;

  @IsString()
  @IsNotEmpty({ message: 'El número patronal es requerido' })
  @MaxLength(100)
  numeroPatronal: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del patrono es requerido' })
  @MaxLength(255)
  nombrePatrono: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  empresa?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroAfiliado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombreAfiliado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  dependenciaSolicitante?: string;

  @IsDateString()
  @IsOptional()
  fechaIngreso?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  documentoSoporte?: string;
}
