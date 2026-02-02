import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Baixa, MotivoBaixa } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateBaixaData {
  bemId: string;
  dataBaixa: Date;
  motivo: MotivoBaixa;
  valorRealizado?: Decimal | null;
  observacoes?: string | null;
  userId?: string | null;
}

@Injectable()
export class BaixasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBaixaData): Promise<Baixa> {
    return this.prisma.baixa.create({
      data,
      include: { bem: true },
    });
  }

  async findById(id: string): Promise<Baixa | null> {
    return this.prisma.baixa.findUnique({
      where: { id },
      include: { bem: true },
    });
  }

  async findByBemId(bemId: string): Promise<Baixa | null> {
    return this.prisma.baixa.findUnique({
      where: { bemId },
      include: { bem: true },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Baixa[]> {
    return this.prisma.baixa.findMany({
      orderBy: { dataBaixa: 'desc' },
      skip,
      take,
      include: { bem: true },
    });
  }

  async count(): Promise<number> {
    return this.prisma.baixa.count();
  }
}
