import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUser } from './interfaces/google-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.googleClientId', ''),
      clientSecret: configService.get<string>('auth.googleClientSecret', ''),
      callbackURL: configService.get<string>('auth.googleCallbackUrl', ''),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const user: GoogleUser = {
      email: profile.emails?.[0]?.value ?? '',
      nombre: profile.displayName ?? 'Usuario Google',
    };

    done(null, user);
  }
}
