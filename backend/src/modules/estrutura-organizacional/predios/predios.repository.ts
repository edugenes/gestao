import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Predio } from '@prisma/client';

export interface CreatePredioData {
  unidadeId: string;
  nome: string;
  codigo?: string;
}

export interface UpdatePredioData {
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class PrediosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePredioData): Promise<Predio> {
    return this.prisma.predio.create({ data });
  }

  async findById(id: string): Promise<Predio | null> {
    return this.prisma.predio.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findManyByUnidade(unidadeId: string): Promise<Predio[]> {
    return this.prisma.predio.findMany({
      where: { unidadeId, deletedAt: null },
      orderBy: { nome: 'asc' },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Predio[]> {
    return this.prisma.predio.findMany({
      where: { deletedAt: null },
      orderBy: [{ unidade: { nome: 'asc' } }, { nome: 'asc' }],
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.predio.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdatePredioData): Promise<Predio> {
    return this.prisma.predio.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Predio> {
    return this.prisma.predio.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
