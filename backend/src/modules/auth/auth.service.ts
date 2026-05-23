import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { GoogleUser } from './interfaces/google-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly oauthClient = new OAuth2Client();

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithGoogle(googleUser: GoogleUser) {
    if (!googleUser.email) {
      throw new UnauthorizedException('Google no devolvio un email valido');
    }

    let usuario = await this.usuariosService.findByEmail(googleUser.email);

    if (!usuario) {
      usuario = await this.usuariosService.createFromGoogle({
        email: googleUser.email,
        nombre: googleUser.nombre,
        rolId: this.configService.get<number>('auth.defaultRoleId', 2),
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

  async loginWithGoogleIdToken(idToken: string) {
    const googleUser = await this.verifyGoogleIdToken(idToken);
    return this.loginWithGoogle(googleUser);
  }

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
        message: 'Este usuario no tiene contraseña local. Use Google.',
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

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleUser> {
    try {
      const audience = this.configService.get<string>(
        'auth.googleClientId',
        '',
      );
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        audience,
      });
      const payload = ticket.getPayload();
      const email = payload?.email ?? '';
      const nombre = payload?.name ?? 'Usuario Google';

      if (!email) {
        throw new UnauthorizedException('El token de Google no contiene email');
      }

      return { email, nombre };
    } catch {
      throw new UnauthorizedException('id_token de Google invalido');
    }
  }
}
