import { Injectable, NotFoundException } from '@nestjs/common';
import { SubcategoriasRepository } from './subcategorias.repository';
import { CategoriasRepository } from '../categorias/categorias.repository';
import type { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import type { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';

@Injectable()
export class SubcategoriasService {
  constructor(
    private readonly repository: SubcategoriasRepository,
    private readonly categoriasRepository: CategoriasRepository,
  ) {}

  async create(dto: CreateSubcategoriaDto): Promise<{
    id: string;
    categoriaId: string;
    nome: string;
    codigo: string | null;
  }> {
    const categoria = await this.categoriasRepository.findById(dto.categoriaId);
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    const sub = await this.repository.create({
      categoriaId: dto.categoriaId,
      nome: dto.nome,
      codigo: dto.codigo,
    });
    return { id: sub.id, categoriaId: sub.categoriaId, nome: sub.nome, codigo: sub.codigo };
  }

  async findMany(page = 1, limit = 50): Promise<{
    data: Array<{ id: string; categoriaId: string; nome: string; codigo: string | null }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((s) => ({ id: s.id, categoriaId: s.categoriaId, nome: s.nome, codigo: s.codigo })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; categoriaId: string; nome: string; codigo: string | null }> {
    const sub = await this.repository.findById(id);
    if (!sub) throw new NotFoundException('Subcategoria não encontrada');
    return { id: sub.id, categoriaId: sub.categoriaId, nome: sub.nome, codigo: sub.codigo };
  }

  async findByCategoria(categoriaId: string): Promise<Array<{ id: string; nome: string; codigo: string | null }>> {
    const categoria = await this.categoriasRepository.findById(categoriaId);
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    const list = await this.repository.findManyByCategoria(categoriaId);
    return list.map((s) => ({ id: s.id, nome: s.nome, codigo: s.codigo }));
  }

  async update(
    id: string,
    dto: UpdateSubcategoriaDto,
  ): Promise<{ id: string; categoriaId: string; nome: string; codigo: string | null }> {
    const sub = await this.repository.findById(id);
    if (!sub) throw new NotFoundException('Subcategoria não encontrada');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, categoriaId: updated.categoriaId, nome: updated.nome, codigo: updated.codigo };
  }

  async softDelete(id: string): Promise<void> {
    const sub = await this.repository.findById(id);
    if (!sub) throw new NotFoundException('Subcategoria não encontrada');
    await this.repository.softDelete(id);
  }
}
