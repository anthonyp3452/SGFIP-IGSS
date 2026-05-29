import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Injectable()
export class InvitacionesService {
  constructor(
    @InjectRepository(Invitacion)
    private readonly repository: Repository<Invitacion>,
  ) {}

  async generar(rolId: number, creadoPor: number, supervisorId?: number): Promise<{ codigo: string }> {
    const codigo = randomUUID();
    await this.repository.insert({ codigo, rolId, creadoPor, supervisorId });
    return { codigo };
  }

  async listar(): Promise<Invitacion[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async validar(codigo: string, rolId: number): Promise<Invitacion> {
    const inv = await this.repository.findOne({ where: { codigo } });
    if (!inv) {
      throw new NotFoundException('Código de invitación inválido');
    }
    if (inv.usado) {
      throw new BadRequestException('El código de invitación ya fue usado');
    }
    if (inv.rolId !== rolId) {
      throw new BadRequestException('El código de invitación no corresponde al rol seleccionado');
    }
    return inv;
  }

  async usar(codigo: string): Promise<void> {
    await this.repository.update({ codigo }, { usado: true, usedAt: new Date() });
  }
}
