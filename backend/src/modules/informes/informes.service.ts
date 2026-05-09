import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SolicitarInformeDto } from './dto/solicitar-informe.dto';
import { Informe } from './informe.entity';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informesRepository: Repository<Informe>,
  ) {}

  async solicitar(inspectorId: number, dto: SolicitarInformeDto): Promise<Informe> {
    const year = new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const count = await this.informesRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    const correlativo = String(count + 1).padStart(3, '0');
    const numeroInforme = `INF-${year}-${correlativo}`;

    const informe = this.informesRepository.create({
      numeroInforme,
      inspectorId,
      nombrePatrono: dto.nombrePatrono,
      nitPatrono: dto.nitPatrono,
      direccionPatrono: dto.direccionPatrono,
      estado: 'Pendiente',
    });

    return this.informesRepository.save(informe);
  }

  findAll(): Promise<Informe[]> {
    return this.informesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
