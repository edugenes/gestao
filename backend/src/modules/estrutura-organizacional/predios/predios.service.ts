import { Injectable, NotFoundException } from '@nestjs/common';
import { PrediosRepository } from './predios.repository';
import { UnidadesRepository } from '../unidades/unidades.repository';
import type { CreatePredioDto } from './dto/create-predio.dto';
import type { UpdatePredioDto } from './dto/update-predio.dto';

@Injectable()
export class PrediosService {
  constructor(
    private readonly repository: PrediosRepository,
    private readonly unidadesRepository: UnidadesRepository,
  ) {}

  async create(dto: CreatePredioDto): Promise<{ id: string; unidadeId: string; nome: string; codigo: string | null }> {
    const unidade = await this.unidadesRepository.findById(dto.unidadeId);
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    const predio = await this.repository.create({
      unidadeId: dto.unidadeId,
      nome: dto.nome,
      codigo: dto.codigo,
    });
    return { id: predio.id, unidadeId: predio.unidadeId, nome: predio.nome, codigo: predio.codigo };
  }

  async findMany(page = 1, limit = 20): Promise<{
    data: Array<{ id: string; unidadeId: string; nome: string; codigo: string | null }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((p) => ({ id: p.id, unidadeId: p.unidadeId, nome: p.nome, codigo: p.codigo })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; unidadeId: string; nome: string; codigo: string | null }> {
    const predio = await this.repository.findById(id);
    if (!predio) throw new NotFoundException('Prédio não encontrado');
    return { id: predio.id, unidadeId: predio.unidadeId, nome: predio.nome, codigo: predio.codigo };
  }

  async findByUnidade(unidadeId: string): Promise<Array<{ id: string; nome: string; codigo: string | null }>> {
    const unidade = await this.unidadesRepository.findById(unidadeId);
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    const predios = await this.repository.findManyByUnidade(unidadeId);
    return predios.map((p) => ({ id: p.id, nome: p.nome, codigo: p.codigo }));
  }

  async update(
    id: string,
    dto: UpdatePredioDto,
  ): Promise<{ id: string; unidadeId: string; nome: string; codigo: string | null }> {
    const predio = await this.repository.findById(id);
    if (!predio) throw new NotFoundException('Prédio não encontrado');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, unidadeId: updated.unidadeId, nome: updated.nome, codigo: updated.codigo };
  }

  async softDelete(id: string): Promise<void> {
    const predio = await this.repository.findById(id);
    if (!predio) throw new NotFoundException('Prédio não encontrado');
    await this.repository.softDelete(id);
  }
}
