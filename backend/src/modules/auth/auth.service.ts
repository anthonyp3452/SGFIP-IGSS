import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
      const audience = this.configService.get<string>('auth.googleClientId', '');
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
