import { Injectable, NotFoundException } from '@nestjs/common';
import { SetoresRepository } from './setores.repository';
import { AndaresRepository } from '../andares/andares.repository';
import { CentrosCustoRepository } from '../centros-custo/centros-custo.repository';
import type { CreateSetorDto } from './dto/create-setor.dto';
import type { UpdateSetorDto } from './dto/update-setor.dto';

@Injectable()
export class SetoresService {
  constructor(
    private readonly repository: SetoresRepository,
    private readonly andaresRepository: AndaresRepository,
    private readonly centrosCustoRepository: CentrosCustoRepository,
  ) {}

  async create(dto: CreateSetorDto): Promise<{
    id: string;
    andarId: string;
    centroCustoId: string | null;
    nome: string;
    codigo: string | null;
  }> {
    const andar = await this.andaresRepository.findById(dto.andarId);
    if (!andar) throw new NotFoundException('Andar não encontrado');
    if (dto.centroCustoId) {
      const centro = await this.centrosCustoRepository.findById(dto.centroCustoId);
      if (!centro) throw new NotFoundException('Centro de custo não encontrado');
    }
    const setor = await this.repository.create({
      andarId: dto.andarId,
      centroCustoId: dto.centroCustoId ?? null,
      nome: dto.nome,
      codigo: dto.codigo,
    });
    return {
      id: setor.id,
      andarId: setor.andarId,
      centroCustoId: setor.centroCustoId,
      nome: setor.nome,
      codigo: setor.codigo,
    };
  }

  async findMany(page = 1, limit = 20): Promise<{
    data: Array<{
      id: string;
      andarId: string;
      centroCustoId: string | null;
      nome: string;
      codigo: string | null;
    }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((s) => ({
        id: s.id,
        andarId: s.andarId,
        centroCustoId: s.centroCustoId,
        nome: s.nome,
        codigo: s.codigo,
      })),
      total,
    };
  }

  async findById(id: string): Promise<{
    id: string;
    andarId: string;
    centroCustoId: string | null;
    nome: string;
    codigo: string | null;
  }> {
    const setor = await this.repository.findById(id);
    if (!setor) throw new NotFoundException('Setor não encontrado');
    return {
      id: setor.id,
      andarId: setor.andarId,
      centroCustoId: setor.centroCustoId,
      nome: setor.nome,
      codigo: setor.codigo,
    };
  }

  async findByAndar(andarId: string): Promise<Array<{ id: string; nome: string; codigo: string | null }>> {
    const andar = await this.andaresRepository.findById(andarId);
    if (!andar) throw new NotFoundException('Andar não encontrado');
    const setores = await this.repository.findManyByAndar(andarId);
    return setores.map((s) => ({ id: s.id, nome: s.nome, codigo: s.codigo }));
  }

  async update(
    id: string,
    dto: UpdateSetorDto,
  ): Promise<{
    id: string;
    andarId: string;
    centroCustoId: string | null;
    nome: string;
    codigo: string | null;
  }> {
    const setor = await this.repository.findById(id);
    if (!setor) throw new NotFoundException('Setor não encontrado');
    if (dto.centroCustoId !== undefined && dto.centroCustoId !== null) {
      const centro = await this.centrosCustoRepository.findById(dto.centroCustoId);
      if (!centro) throw new NotFoundException('Centro de custo não encontrado');
    }
    const updated = await this.repository.update(id, dto);
    return {
      id: updated.id,
      andarId: updated.andarId,
      centroCustoId: updated.centroCustoId,
      nome: updated.nome,
      codigo: updated.codigo,
    };
  }

  async softDelete(id: string): Promise<void> {
    const setor = await this.repository.findById(id);
    if (!setor) throw new NotFoundException('Setor não encontrado');
    await this.repository.softDelete(id);
  }
}
