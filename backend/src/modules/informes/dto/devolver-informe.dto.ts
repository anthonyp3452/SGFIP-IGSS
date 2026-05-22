import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DevolverInformeDto {
  @IsString()
  @IsNotEmpty({
    message: 'La observación es requerida para devolver el informe',
  })
  @MaxLength(1000, {
    message: 'La observación no puede exceder 1000 caracteres',
  })
  observacion: string;
}
