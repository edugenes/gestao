import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Depreciacao, MetodoDepreciacao } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateDepreciacaoData {
  bemId: string;
  mesReferencia: Date;
  valorDepreciado: Decimal;
  metodo: MetodoDepreciacao;
}

@Injectable()
export class DepreciacoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDepreciacaoData): Promise<Depreciacao> {
    return this.prisma.depreciacao.create({
      data,
      include: { bem: true },
    });
  }

  async findById(id: string): Promise<Depreciacao | null> {
    return this.prisma.depreciacao.findUnique({
      where: { id },
      include: { bem: true },
    });
  }

  async findManyByBemId(bemId: string): Promise<Depreciacao[]> {
    return this.prisma.depreciacao.findMany({
      where: { bemId },
      orderBy: { mesReferencia: 'desc' },
      include: { bem: true },
    });
  }

  async findMany(skip?: number, take?: number, bemId?: string): Promise<Depreciacao[]> {
    const where = bemId ? { bemId } : {};
    return this.prisma.depreciacao.findMany({
      where,
      orderBy: { mesReferencia: 'desc' },
      skip,
      take,
      include: { bem: true },
    });
  }

  async count(bemId?: string): Promise<number> {
    const where = bemId ? { bemId } : {};
    return this.prisma.depreciacao.count({ where });
  }

  async findByBemAndMes(bemId: string, mesReferencia: Date): Promise<Depreciacao | null> {
    const start = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);
    const end = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 0);
    return this.prisma.depreciacao.findFirst({
      where: {
        bemId,
        mesReferencia: { gte: start, lte: end },
      },
    });
  }
}
