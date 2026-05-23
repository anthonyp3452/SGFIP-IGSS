import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleUser } from './interfaces/google-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  loginLocal(@Body() body: LoginDto) {
    return this.authService.loginLocal(body.email, body.password);
  }

  @Post('google')
  googleAuthByIdToken(@Body() body: GoogleAuthDto) {
    return this.authService.loginWithGoogleIdToken(body.id_token);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Req() req: Request & { user: GoogleUser }) {
    return this.authService.loginWithGoogle(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: unknown }) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  adminOnly(@Req() req: Request & { user: JwtPayload }) {
    return {
      message: 'Acceso permitido para rol administrador',
      user: req.user,
    };
  }
}
