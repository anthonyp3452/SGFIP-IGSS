import { IsIn, IsInt, IsOptional } from 'class-validator';

export class GenerarInvitacionDto {
  @IsInt()
  @IsIn([2, 3], { message: 'El rol debe ser 2 (inspector) o 3 (supervisor)' })
  rolId: number;

  @IsInt()
  @IsOptional()
  supervisorId?: number;
}
