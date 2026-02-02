import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriasRepository } from './categorias.repository';
import type { CreateCategoriaDto } from './dto/create-categoria.dto';
import type { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly repository: CategoriasRepository) {}

  async create(dto: CreateCategoriaDto): Promise<{ id: string; nome: string; codigo: string | null }> {
    const categoria = await this.repository.create({ nome: dto.nome, codigo: dto.codigo });
    return { id: categoria.id, nome: categoria.nome, codigo: categoria.codigo };
  }

  async findMany(page = 1, limit = 50): Promise<{
    data: Array<{ id: string; nome: string; codigo: string | null }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((c) => ({ id: c.id, nome: c.nome, codigo: c.codigo })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; nome: string; codigo: string | null }> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return { id: categoria.id, nome: categoria.nome, codigo: categoria.codigo };
  }

  async update(id: string, dto: UpdateCategoriaDto): Promise<{ id: string; nome: string; codigo: string | null }> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, nome: updated.nome, codigo: updated.codigo };
  }

  async softDelete(id: string): Promise<void> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    await this.repository.softDelete(id);
  }
}
