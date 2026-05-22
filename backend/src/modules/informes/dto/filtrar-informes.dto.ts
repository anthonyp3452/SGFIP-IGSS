import { IsIn, IsOptional } from 'class-validator';
import { ESTADOS_VALIDOS } from '../const/informe-estados';

export class FiltrarInformesDto {
  @IsOptional()
  @IsIn(ESTADOS_VALIDOS, { message: 'Estado no válido' })
  estado?: string;
}
