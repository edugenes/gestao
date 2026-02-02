import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Categoria } from '@prisma/client';

export interface CreateCategoriaData {
  nome: string;
  codigo?: string;
}

export interface UpdateCategoriaData {
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class CategoriasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoriaData): Promise<Categoria> {
    return this.prisma.categoria.create({ data });
  }

  async findById(id: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null },
      orderBy: { nome: 'asc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.categoria.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateCategoriaData): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
