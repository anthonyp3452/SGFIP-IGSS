import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SolicitarInformeDto {
  @IsString()
  @IsNotEmpty()
  nombrePatrono: string;

  @IsString()
  @IsNotEmpty()
  nitPatrono: string;

  @IsString()
  @IsOptional()
  direccionPatrono?: string;
}
