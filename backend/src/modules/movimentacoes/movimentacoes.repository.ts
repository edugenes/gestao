import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Movimentacao, TipoMovimentacao } from '@prisma/client';

export interface CreateMovimentacaoData {
  bemId: string;
  tipo: TipoMovimentacao;
  setorOrigemId?: string | null;
  setorDestinoId?: string | null;
  dataMovimentacao: Date;
  dataDevolucao?: Date | null;
  observacoes?: string | null;
  userId?: string | null;
}

@Injectable()
export class MovimentacoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMovimentacaoData): Promise<Movimentacao> {
    return this.prisma.movimentacao.create({
      data,
      include: { bem: true, setorOrigem: true, setorDestino: true },
    });
  }

  async findById(id: string): Promise<Movimentacao | null> {
    return this.prisma.movimentacao.findUnique({
      where: { id },
      include: { bem: true, setorOrigem: true, setorDestino: true },
    });
  }

  async findManyByBemId(bemId: string, limit = 50): Promise<Movimentacao[]> {
    return this.prisma.movimentacao.findMany({
      where: { bemId },
      orderBy: { dataMovimentacao: 'desc' },
      take: limit,
      include: { setorOrigem: true, setorDestino: true },
    });
  }

  async findMany(skip?: number, take?: number, bemId?: string): Promise<Movimentacao[]> {
    const where = bemId ? { bemId } : {};
    return this.prisma.movimentacao.findMany({
      where,
      orderBy: { dataMovimentacao: 'desc' },
      skip,
      take,
      include: { bem: true, setorOrigem: true, setorDestino: true },
    });
  }

  async count(bemId?: string): Promise<number> {
    const where = bemId ? { bemId } : {};
    return this.prisma.movimentacao.count({ where });
  }
}
