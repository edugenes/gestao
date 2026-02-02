import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UnidadesRepository } from './unidades.repository';
import type { CreateUnidadeDto } from './dto/create-unidade.dto';
import type { UpdateUnidadeDto } from './dto/update-unidade.dto';

@Injectable()
export class UnidadesService {
  constructor(private readonly repository: UnidadesRepository) {}

  async create(dto: CreateUnidadeDto): Promise<{ id: string; nome: string; codigo: string | null }> {
    if (dto.codigo) {
      const existing = await this.repository.findByCodigo(dto.codigo);
      if (existing) throw new ConflictException('Código já utilizado');
    }
    const unidade = await this.repository.create({
      nome: dto.nome,
      codigo: dto.codigo,
    });
    return { id: unidade.id, nome: unidade.nome, codigo: unidade.codigo };
  }

  async findMany(page = 1, limit = 20): Promise<{ data: Array<{ id: string; nome: string; codigo: string | null }>; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((u) => ({ id: u.id, nome: u.nome, codigo: u.codigo })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; nome: string; codigo: string | null }> {
    const unidade = await this.repository.findById(id);
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    return { id: unidade.id, nome: unidade.nome, codigo: unidade.codigo };
  }

  async update(id: string, dto: UpdateUnidadeDto): Promise<{ id: string; nome: string; codigo: string | null }> {
    const unidade = await this.repository.findById(id);
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, nome: updated.nome, codigo: updated.codigo };
  }

  async softDelete(id: string): Promise<void> {
    const unidade = await this.repository.findById(id);
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    await this.repository.softDelete(id);
  }
}
