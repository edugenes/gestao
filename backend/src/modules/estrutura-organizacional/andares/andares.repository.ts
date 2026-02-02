import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Andar } from '@prisma/client';

export interface CreateAndarData {
  predioId: string;
  nome: string;
  codigo?: string;
}

export interface UpdateAndarData {
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class AndaresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAndarData): Promise<Andar> {
    return this.prisma.andar.create({ data });
  }

  async findById(id: string): Promise<Andar | null> {
    return this.prisma.andar.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findManyByPredio(predioId: string): Promise<Andar[]> {
    return this.prisma.andar.findMany({
      where: { predioId, deletedAt: null },
      orderBy: { nome: 'asc' },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Andar[]> {
    return this.prisma.andar.findMany({
      where: { deletedAt: null },
      orderBy: [{ predio: { nome: 'asc' } }, { nome: 'asc' }],
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.andar.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateAndarData): Promise<Andar> {
    return this.prisma.andar.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Andar> {
    return this.prisma.andar.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
