import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  private buildUsername(raw: string): string {
    const clean = raw.trim().toLowerCase();
    return clean.endsWith('.igss') ? clean : `${clean}.igss`;
  }

  async register(params: {
    nombre: string;
    username: string;
    password: string;
    rolId: number;
    supervisorId?: number;
  }) {
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
      rolId: params.rolId,
      supervisorId: params.supervisorId,
    });

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

    if (!usuario) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    if (!usuario.passwordHash) {
      throw new UnauthorizedException({
        code: 'INVALID_PASSWORD',
        message:
          'Este usuario no tiene contraseña local. Contacte al administrador.',
      });
    }

    const passwordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_PASSWORD',
        message: 'Contraseña incorrecta',
      });
    }

    if (!usuario.activo) {
      throw new UnauthorizedException({
        code: 'USER_INACTIVE',
        message: 'Usuario inactivo',
      });
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
