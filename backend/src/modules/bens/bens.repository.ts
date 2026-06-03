import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Bem, EstadoConservacao, SituacaoBem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateBemData {
  numeroPatrimonial: string;
  setorId: string;
  subcategoriaId?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  valorAquisicao: Decimal;
  dataAquisicao: Date;
  vidaUtilMeses: number;
  garantiaMeses?: number | null;
  estadoConservacao: EstadoConservacao;
  situacao?: SituacaoBem;
  observacoes?: string | null;
}

export interface UpdateBemData {
  setorId?: string;
  subcategoriaId?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  valorAquisicao?: Decimal;
  dataAquisicao?: Date;
  vidaUtilMeses?: number;
  garantiaMeses?: number | null;
  estadoConservacao?: EstadoConservacao;
  situacao?: SituacaoBem;
  observacoes?: string | null;
  active?: boolean;
}

export interface ListBensFilter {
  setorId?: string;
  situacao?: SituacaoBem;
  numeroPatrimonial?: string; // busca parcial
  categoriaId?: string;
  valorMin?: number;
  valorMax?: number;
  dataInicio?: Date;
  dataFim?: Date;
}

@Injectable()
export class BensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBemData): Promise<Bem> {
    return this.prisma.bem.create({
      data: {
        ...data,
        situacao: data.situacao ?? 'EM_USO',
      },
    });
  }

  async findById(id: string): Promise<Bem | null> {
    return this.prisma.bem.findFirst({
      where: { id, deletedAt: null },
      include: {
        setor: true,
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  async findByNumeroPatrimonial(numero: string): Promise<Bem | null> {
    return this.prisma.bem.findFirst({
      where: { numeroPatrimonial: numero, deletedAt: null },
    });
  }

  async findMany(
    filter: ListBensFilter,
    skip?: number,
    take?: number,
  ): Promise<Bem[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filter.setorId) where.setorId = filter.setorId;
    if (filter.situacao) where.situacao = filter.situacao;
    if (filter.numeroPatrimonial) {
      where.numeroPatrimonial = { contains: filter.numeroPatrimonial, mode: 'insensitive' };
    }
    if (filter.categoriaId) {
      where.subcategoria = { categoriaId: filter.categoriaId };
    }
    if (filter.valorMin != null || filter.valorMax != null) {
      where.valorAquisicao = {
        ...(filter.valorMin != null ? { gte: new Decimal(filter.valorMin) } : {}),
        ...(filter.valorMax != null ? { lte: new Decimal(filter.valorMax) } : {}),
      };
    }
    if (filter.dataInicio || filter.dataFim) {
      where.dataAquisicao = {
        ...(filter.dataInicio ? { gte: filter.dataInicio } : {}),
        ...(filter.dataFim ? { lte: filter.dataFim } : {}),
      };
    }
    return this.prisma.bem.findMany({
      where,
      orderBy: { numeroPatrimonial: 'asc' },
      skip,
      take,
      include: {
        setor: true,
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  async count(filter: ListBensFilter): Promise<number> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filter.setorId) where.setorId = filter.setorId;
    if (filter.situacao) where.situacao = filter.situacao;
    if (filter.numeroPatrimonial) {
      where.numeroPatrimonial = { contains: filter.numeroPatrimonial, mode: 'insensitive' };
    }
    if (filter.categoriaId) {
      where.subcategoria = { categoriaId: filter.categoriaId };
    }
    if (filter.valorMin != null || filter.valorMax != null) {
      where.valorAquisicao = {
        ...(filter.valorMin != null ? { gte: new Decimal(filter.valorMin) } : {}),
        ...(filter.valorMax != null ? { lte: new Decimal(filter.valorMax) } : {}),
      };
    }
    if (filter.dataInicio || filter.dataFim) {
      where.dataAquisicao = {
        ...(filter.dataInicio ? { gte: filter.dataInicio } : {}),
        ...(filter.dataFim ? { lte: filter.dataFim } : {}),
      };
    }
    return this.prisma.bem.count({ where });
  }

  async update(id: string, data: UpdateBemData): Promise<Bem> {
    return this.prisma.bem.update({
      where: { id },
      data,
      include: {
        setor: true,
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  async softDelete(id: string): Promise<Bem> {
    return this.prisma.bem.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
      include: {
        setor: true,
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  /** Bens ativos (não baixados) com data de aquisição até o fim do mês – para cálculo de depreciação. */
  async findManyEligibleForDepreciacao(mesReferencia: Date): Promise<Array<{ id: string; valorAquisicao: Decimal; vidaUtilMeses: number }>> {
    const fimDoMes = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 0, 23, 59, 59, 999);
    return this.prisma.bem.findMany({
      where: {
        deletedAt: null,
        situacao: { not: 'BAIXADO' },
        dataAquisicao: { lte: fimDoMes },
      },
      select: { id: true, valorAquisicao: true, vidaUtilMeses: true },
    });
  }
}
