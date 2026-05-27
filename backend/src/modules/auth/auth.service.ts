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

  async register(params: {
    nombre: string;
    email: string;
    password: string;
    rolId: number;
    supervisorId?: number;
  }) {
    const existe = await this.usuariosService.findByEmail(params.email);
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const usuario = await this.usuariosService.createLocal({
      nombre: params.nombre,
      email: params.email,
      passwordHash,
      rolId: params.rolId,
      supervisorId: params.supervisorId,
    });

    return {
      accessToken: await this.createAccessToken(usuario),
      user: {
        usuarioId: usuario.usuarioId,
        nombre: usuario.nombre,
        email: usuario.email,
        rolId: usuario.rolId,
        activo: usuario.activo,
      },
    };
  }

  async loginLocal(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);

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
        email: usuario.email,
        rolId: usuario.rolId,
        activo: usuario.activo,
      },
    };
  }

  private createAccessToken(usuario: Usuario): Promise<string> {
    const payload: JwtPayload = {
      usuario_id: usuario.usuarioId,
      email: usuario.email,
      rol_id: usuario.rolId,
      sub: usuario.usuarioId,
    };

    return this.jwtService.signAsync(payload);
  }
}
