import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsInt()
  @IsIn([2, 3], { message: 'El rol debe ser 2 (inspector) o 3 (supervisor)' })
  rolId: number;

  @IsInt()
  @IsOptional()
  supervisorId?: number;

  @IsString()
  @IsNotEmpty({ message: 'El código de invitación es requerido' })
  codigo: string;
}
