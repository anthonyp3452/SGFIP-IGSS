import { IsInt, IsOptional, Min } from 'class-validator';

export class SolicitarInformeDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  inspectorId?: number;
}
