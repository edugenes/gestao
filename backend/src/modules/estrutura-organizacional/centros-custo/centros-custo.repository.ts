import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CentroCusto } from '@prisma/client';

export interface CreateCentroCustoData {
  codigo: string;
  descricao: string;
}

export interface UpdateCentroCustoData {
  codigo?: string;
  descricao?: string;
  active?: boolean;
}

@Injectable()
export class CentrosCustoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCentroCustoData): Promise<CentroCusto> {
    return this.prisma.centroCusto.create({ data });
  }

  async findById(id: string): Promise<CentroCusto | null> {
    return this.prisma.centroCusto.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCodigo(codigo: string): Promise<CentroCusto | null> {
    return this.prisma.centroCusto.findFirst({
      where: { codigo, deletedAt: null },
    });
  }

  async findMany(skip?: number, take?: number): Promise<CentroCusto[]> {
    return this.prisma.centroCusto.findMany({
      where: { deletedAt: null },
      orderBy: { codigo: 'asc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.centroCusto.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateCentroCustoData): Promise<CentroCusto> {
    return this.prisma.centroCusto.update({
      where: { id },
      data: {
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<CentroCusto> {
    return this.prisma.centroCusto.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
