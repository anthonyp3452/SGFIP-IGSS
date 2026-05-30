import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly invitacionesService: InvitacionesService,
  ) {}

  private buildUsername(raw: string): string {
    const clean = raw.trim().toLowerCase();
    return clean.endsWith('.igss') ? clean : `${clean}.igss`;
  }

  async register(params: {
    nombre: string;
    username: string;
    password: string;
    codigo: string;
  }) {
    const inv = await this.invitacionesService.validar(params.codigo);

    const fullUsername = this.buildUsername(params.username);

    const existe = await this.usuariosService.findByUsername(fullUsername);
    if (existe) {
      throw new ConflictException('El usuario ya está registrado');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const usuario = await this.usuariosService.createLocal({
      nombre: params.nombre,
      username: fullUsername,
      passwordHash,
      rolId: inv.rolId,
      supervisorId: inv.supervisorId,
    });

    await this.invitacionesService.usar(params.codigo);

    return {
      accessToken: await this.createAccessToken(usuario),
      user: {
        usuarioId: usuario.usuarioId,
        nombre: usuario.nombre,
        username: usuario.username,
        rolId: usuario.rolId,
        activo: usuario.activo,
      },
    };
  }

  async loginLocal(username: string, password: string) {
    const fullUsername = this.buildUsername(username);
    const usuario = await this.usuariosService.findByUsername(fullUsername);

    if (
      !usuario ||
      !usuario.passwordHash ||
      !usuario.activo ||
      !(await bcrypt.compare(password, usuario.passwordHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      accessToken: await this.createAccessToken(usuario),
      user: {
        usuarioId: usuario.usuarioId,
        nombre: usuario.nombre,
        username: usuario.username,
        rolId: usuario.rolId,
        activo: usuario.activo,
      },
    };
  }

  private createAccessToken(usuario: Usuario): Promise<string> {
    const payload: JwtPayload = {
      usuario_id: usuario.usuarioId,
      username: usuario.username,
      rol_id: usuario.rolId,
      sub: usuario.usuarioId,
    };

    return this.jwtService.signAsync(payload);
  }
}
