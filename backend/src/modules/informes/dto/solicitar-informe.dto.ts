import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class SolicitarInformeDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'La orden de trabajo es requerida' })
  ordenTrabajoId: number;

  @IsString()
  @IsNotEmpty({ message: 'El tipo es requerido' })
  @IsIn(['informe', 'acta'], { message: 'El tipo debe ser "informe" o "acta"' })
  tipo: string;
}
