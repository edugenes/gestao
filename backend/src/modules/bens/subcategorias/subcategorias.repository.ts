import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Subcategoria } from '@prisma/client';

export interface CreateSubcategoriaData {
  categoriaId: string;
  nome: string;
  codigo?: string;
}

export interface UpdateSubcategoriaData {
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class SubcategoriasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSubcategoriaData): Promise<Subcategoria> {
    return this.prisma.subcategoria.create({ data });
  }

  async findById(id: string): Promise<Subcategoria | null> {
    return this.prisma.subcategoria.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findManyByCategoria(categoriaId: string): Promise<Subcategoria[]> {
    return this.prisma.subcategoria.findMany({
      where: { categoriaId, deletedAt: null },
      orderBy: { nome: 'asc' },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Subcategoria[]> {
    return this.prisma.subcategoria.findMany({
      where: { deletedAt: null },
      orderBy: [{ categoria: { nome: 'asc' } }, { nome: 'asc' }],
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.subcategoria.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateSubcategoriaData): Promise<Subcategoria> {
    return this.prisma.subcategoria.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Subcategoria> {
    return this.prisma.subcategoria.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
