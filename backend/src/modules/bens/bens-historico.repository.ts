import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import type { BemHistorico } from '@prisma/client';

export interface CreateHistoricoData {
  bemId: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  userId: string | null;
}

@Injectable()
export class BensHistoricoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHistoricoData): Promise<void> {
    await this.prisma.bemHistorico.create({
      data: {
        bemId: data.bemId,
        campo: data.campo,
        valorAnterior: data.valorAnterior,
        valorNovo: data.valorNovo,
        userId: data.userId,
      },
    });
  }

  async findManyByBemId(bemId: string, limit = 100): Promise<
    Array<{
      id: string;
      campo: string;
      valorAnterior: string | null;
      valorNovo: string | null;
      userId: string | null;
      createdAt: Date;
    }>
  > {
    const list = await this.prisma.bemHistorico.findMany({
      where: { bemId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return list.map((h: BemHistorico) => ({
      id: h.id,
      campo: h.campo,
      valorAnterior: h.valorAnterior,
      valorNovo: h.valorNovo,
      userId: h.userId,
      createdAt: h.createdAt,
    }));
  }
}
