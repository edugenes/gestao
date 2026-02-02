import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Inventario, InventarioItem, StatusInventario } from '@prisma/client';

export interface CreateInventarioData {
  descricao: string;
  dataInicio: Date;
}

export interface CreateInventarioItemData {
  inventarioId: string;
  bemId: string;
  conferido?: boolean;
  dataConferencia?: Date | null;
  userId?: string | null;
  divergencia?: string | null;
}

export interface UpdateInventarioItemData {
  conferido?: boolean;
  dataConferencia?: Date | null;
  userId?: string | null;
  divergencia?: string | null;
}

@Injectable()
export class InventariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createInventario(data: CreateInventarioData): Promise<Inventario> {
    return this.prisma.inventario.create({ data });
  }

  async findInventarioById(id: string): Promise<Inventario | null> {
    return this.prisma.inventario.findUnique({
      where: { id },
      include: { itens: { include: { bem: true } } },
    });
  }

  async findInventarios(skip?: number, take?: number, status?: StatusInventario): Promise<Inventario[]> {
    const where = status ? { status } : {};
    return this.prisma.inventario.findMany({
      where,
      orderBy: { dataInicio: 'desc' },
      skip,
      take,
    });
  }

  async countInventarios(status?: StatusInventario): Promise<number> {
    const where = status ? { status } : {};
    return this.prisma.inventario.count({ where });
  }

  async updateInventarioStatus(id: string, status: StatusInventario, dataFim?: Date): Promise<Inventario> {
    return this.prisma.inventario.update({
      where: { id },
      data: { status, ...(dataFim !== undefined && { dataFim }) },
    });
  }

  async createItem(data: CreateInventarioItemData): Promise<InventarioItem> {
    return this.prisma.inventarioItem.create({
      data,
      include: { bem: true },
    });
  }

  async findItemById(id: string): Promise<InventarioItem | null> {
    return this.prisma.inventarioItem.findUnique({
      where: { id },
      include: { inventario: true, bem: true },
    });
  }

  async findItensByInventario(inventarioId: string): Promise<InventarioItem[]> {
    return this.prisma.inventarioItem.findMany({
      where: { inventarioId },
      include: { bem: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateItem(id: string, data: UpdateInventarioItemData): Promise<InventarioItem> {
    return this.prisma.inventarioItem.update({
      where: { id },
      data,
      include: { bem: true },
    });
  }

  async findItemByInventarioAndBem(inventarioId: string, bemId: string): Promise<InventarioItem | null> {
    return this.prisma.inventarioItem.findFirst({
      where: { inventarioId, bemId },
    });
  }
}
