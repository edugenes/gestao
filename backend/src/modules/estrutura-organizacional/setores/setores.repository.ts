import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Setor } from '@prisma/client';

export interface CreateSetorData {
  andarId: string;
  centroCustoId?: string | null;
  nome: string;
  codigo?: string;
}

export interface UpdateSetorData {
  centroCustoId?: string | null;
  nome?: string;
  codigo?: string | null;
  active?: boolean;
}

@Injectable()
export class SetoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSetorData): Promise<Setor> {
    return this.prisma.setor.create({ data });
  }

  async findById(id: string): Promise<Setor | null> {
    return this.prisma.setor.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findManyByAndar(andarId: string): Promise<Setor[]> {
    return this.prisma.setor.findMany({
      where: { andarId, deletedAt: null },
      orderBy: { nome: 'asc' },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Setor[]> {
    return this.prisma.setor.findMany({
      where: { deletedAt: null },
      orderBy: [{ andar: { nome: 'asc' } }, { nome: 'asc' }],
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.setor.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateSetorData): Promise<Setor> {
    return this.prisma.setor.update({
      where: { id },
      data: {
        ...(data.centroCustoId !== undefined && { centroCustoId: data.centroCustoId }),
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Setor> {
    return this.prisma.setor.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
