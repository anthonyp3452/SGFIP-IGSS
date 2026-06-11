import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import { FiltrarOrdenesDto } from './dto/filtrar-ordenes.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(
    private readonly ordenesService: OrdenesTrabajoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  crear(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CrearOrdenTrabajoDto,
  ) {
    return this.ordenesService.crear(req.user.usuario_id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filtros: FiltrarOrdenesDto) {
    return this.ordenesService.findAll(filtros);
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard)
  pendientes() {
    return this.ordenesService.findPendientes();
  }

  @Get('mis-ordenes')
  @UseGuards(JwtAuthGuard)
  misOrdenes(
    @Req() req: Request & { user: JwtPayload },
    @Query() filtros: FiltrarOrdenesDto,
  ) {
    return this.ordenesService.findByInspector(
      req.user.usuario_id,
      filtros.estado,
    );
  }

  @Get('mis-creadas')
  @UseGuards(JwtAuthGuard)
  @Roles(3)
  misCreadas(
    @Req() req: Request & { user: JwtPayload },
    @Query() filtros: FiltrarOrdenesDto,
  ) {
    return this.ordenesService.findBySupervisor(
      req.user.usuario_id,
      filtros.estado,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.findById(id);
  }

  @Patch(':id/anular')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  anular(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordenesService.anular(id, req.user.usuario_id);
  }
}
