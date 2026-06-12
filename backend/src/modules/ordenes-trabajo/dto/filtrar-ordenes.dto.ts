import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FiltrarOrdenesDto {
  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  inspectorId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  supervisorId?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
