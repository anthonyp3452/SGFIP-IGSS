import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9._-]+$/i, {
    message: 'El usuario solo puede contener letras, números, puntos, guiones bajos y medios',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*\d)/, { message: 'La contraseña debe contener al menos un número' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'La contraseña debe contener al menos un carácter especial',
  })
  password: string;

  @IsInt()
  rolId: number;

  @IsOptional()
  @IsInt()
  supervisorId?: number;
}
