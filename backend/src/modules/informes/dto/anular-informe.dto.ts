import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AnularInformeDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de anulación es requerido' })
  @MaxLength(1000, { message: 'El motivo no puede exceder 1000 caracteres' })
  motivo: string;
}
