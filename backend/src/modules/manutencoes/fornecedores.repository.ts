import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Fornecedor } from '@prisma/client';

export interface CreateFornecedorData {
  nome: string;
  contato?: string | null;
}

export interface UpdateFornecedorData {
  nome?: string;
  contato?: string | null;
  active?: boolean;
}

@Injectable()
export class FornecedoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFornecedorData): Promise<Fornecedor> {
    return this.prisma.fornecedor.create({ data });
  }

  async findById(id: string): Promise<Fornecedor | null> {
    return this.prisma.fornecedor.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(skip?: number, take?: number): Promise<Fornecedor[]> {
    return this.prisma.fornecedor.findMany({
      where: { deletedAt: null },
      orderBy: { nome: 'asc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.fornecedor.count({ where: { deletedAt: null } });
  }

  async update(id: string, data: UpdateFornecedorData): Promise<Fornecedor> {
    return this.prisma.fornecedor.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.contato !== undefined && { contato: data.contato }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<Fornecedor> {
    return this.prisma.fornecedor.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
