import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AprobarInformeDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de oficio es requerido' })
  @MaxLength(100)
  noOficio: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de oficio es requerida' })
  fechaOficio: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo envío es requerido' })
  @MaxLength(500)
  envio: string;
}
