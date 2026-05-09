import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      order: { usuarioId: 'ASC' },
    });
  }

  async findOneById(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { usuarioId: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return usuario;
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { email },
    });
  }

  async createFromGoogle(params: {
    email: string;
    nombre: string;
    rolId: number;
  }): Promise<Usuario> {
    const usuario = this.usuariosRepository.create({
      email: params.email,
      nombre: params.nombre,
      rolId: params.rolId,
      activo: true,
    });

    return this.usuariosRepository.save(usuario);
  }

  async createLocal(params: {
    email: string;
    nombre: string;
    passwordHash: string;
    rolId: number;
  }): Promise<Usuario> {
    const usuario = this.usuariosRepository.create({
      email: params.email,
      nombre: params.nombre,
      passwordHash: params.passwordHash,
      rolId: params.rolId,
      activo: true,
    });

    return this.usuariosRepository.save(usuario);
  }
}
