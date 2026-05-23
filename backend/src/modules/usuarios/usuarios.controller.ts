import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Usuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }

  @Get('inspectores')
  @UseGuards(JwtAuthGuard)
  findInspectores(): Promise<Usuario[]> {
    return this.usuariosService.findByRol(2);
  }

  @Get('supervisores')
  @UseGuards(JwtAuthGuard)
  findSupervisores(): Promise<Usuario[]> {
    return this.usuariosService.findSupervisores();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuariosService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async crear(
    @Req() req: Request & { user: JwtPayload },
    @Body()
    body: {
      nombre: string;
      email: string;
      passwordHash: string;
      rolId: number;
      supervisorId?: number;
    },
  ) {
    return this.usuariosService.createLocal(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Usuario>,
  ) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.remove(id);
    return { message: `Usuario #${id} eliminado` };
  }
}
