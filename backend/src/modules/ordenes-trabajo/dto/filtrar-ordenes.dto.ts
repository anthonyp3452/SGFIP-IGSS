import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FiltrarOrdenesDto {
  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  inspectorId?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
