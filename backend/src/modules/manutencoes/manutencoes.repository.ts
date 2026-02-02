import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Manutencao, TipoManutencao } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateManutencaoData {
  bemId: string;
  tipo: TipoManutencao;
  dataInicio: Date;
  dataFim?: Date | null;
  custo?: Decimal | null;
  fornecedorId?: string | null;
  observacoes?: string | null;
}

export interface UpdateManutencaoData {
  dataFim?: Date | null;
  custo?: Decimal | null;
  fornecedorId?: string | null;
  observacoes?: string | null;
}

@Injectable()
export class ManutencoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateManutencaoData): Promise<Manutencao> {
    return this.prisma.manutencao.create({
      data,
      include: { bem: true, fornecedor: true },
    });
  }

  async findById(id: string): Promise<Manutencao | null> {
    return this.prisma.manutencao.findUnique({
      where: { id },
      include: { bem: true, fornecedor: true },
    });
  }

  async findManyByBemId(bemId: string): Promise<Manutencao[]> {
    return this.prisma.manutencao.findMany({
      where: { bemId },
      orderBy: { dataInicio: 'desc' },
      include: { fornecedor: true },
    });
  }

  async findMany(skip?: number, take?: number, bemId?: string): Promise<Manutencao[]> {
    const where = bemId ? { bemId } : {};
    return this.prisma.manutencao.findMany({
      where,
      orderBy: { dataInicio: 'desc' },
      skip,
      take,
      include: { bem: true, fornecedor: true },
    });
  }

  async count(bemId?: string): Promise<number> {
    const where = bemId ? { bemId } : {};
    return this.prisma.manutencao.count({ where });
  }

  async update(id: string, data: UpdateManutencaoData): Promise<Manutencao> {
    return this.prisma.manutencao.update({
      where: { id },
      data,
      include: { bem: true, fornecedor: true },
    });
  }
}
