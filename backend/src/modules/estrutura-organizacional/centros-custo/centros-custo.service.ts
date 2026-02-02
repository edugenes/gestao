import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CentrosCustoRepository } from './centros-custo.repository';
import type { CreateCentroCustoDto } from './dto/create-centro-custo.dto';
import type { UpdateCentroCustoDto } from './dto/update-centro-custo.dto';

@Injectable()
export class CentrosCustoService {
  constructor(private readonly repository: CentrosCustoRepository) {}

  async create(dto: CreateCentroCustoDto): Promise<{ id: string; codigo: string; descricao: string }> {
    const existing = await this.repository.findByCodigo(dto.codigo);
    if (existing) throw new ConflictException('Código de centro de custo já utilizado');
    const centro = await this.repository.create({
      codigo: dto.codigo,
      descricao: dto.descricao,
    });
    return { id: centro.id, codigo: centro.codigo, descricao: centro.descricao };
  }

  async findMany(page = 1, limit = 20): Promise<{
    data: Array<{ id: string; codigo: string; descricao: string }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((c) => ({ id: c.id, codigo: c.codigo, descricao: c.descricao })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; codigo: string; descricao: string }> {
    const centro = await this.repository.findById(id);
    if (!centro) throw new NotFoundException('Centro de custo não encontrado');
    return { id: centro.id, codigo: centro.codigo, descricao: centro.descricao };
  }

  async update(
    id: string,
    dto: UpdateCentroCustoDto,
  ): Promise<{ id: string; codigo: string; descricao: string }> {
    const centro = await this.repository.findById(id);
    if (!centro) throw new NotFoundException('Centro de custo não encontrado');
    if (dto.codigo !== undefined && dto.codigo !== centro.codigo) {
      const existing = await this.repository.findByCodigo(dto.codigo);
      if (existing) throw new ConflictException('Código de centro de custo já utilizado');
    }
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, codigo: updated.codigo, descricao: updated.descricao };
  }

  async softDelete(id: string): Promise<void> {
    const centro = await this.repository.findById(id);
    if (!centro) throw new NotFoundException('Centro de custo não encontrado');
    await this.repository.softDelete(id);
  }
}
