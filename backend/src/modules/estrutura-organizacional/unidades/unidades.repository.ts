import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Unidade } from '@prisma/client';

export interface CreateUnidadeData {
  nome: string;
  codigo?: string;
}

export interface UpdateUnidadeData {
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class UnidadesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUnidadeData): Promise<Unidade> {
    return this.prisma.unidade.create({ data });
  }

  async findById(id: string): Promise<Unidade | null> {
    return this.prisma.unidade.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCodigo(codigo: string): Promise<Unidade | null> {
    return this.prisma.unidade.findFirst({
      where: { codigo, deletedAt: null },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Unidade[]> {
    return this.prisma.unidade.findMany({
      where: { deletedAt: null },
      orderBy: { nome: 'asc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.unidade.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateUnidadeData): Promise<Unidade> {
    return this.prisma.unidade.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Unidade> {
    return this.prisma.unidade.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
