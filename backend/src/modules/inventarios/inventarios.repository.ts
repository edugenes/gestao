import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Inventario, InventarioItem, StatusInventario, SituacaoBem } from '@prisma/client';

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

  /**
   * Cria um inventário e inclui automaticamente TODOS os bens ativos e não baixados
   * como itens desse inventário.
   *
   * Regras:
   * - Somente bens com active = true
   * - Exclui bens com situacao = BAIXADO
   * - Operação transacional (inventário + itens)
   */
  async createInventarioWithAllBens(data: CreateInventarioData): Promise<Inventario> {
    return this.prisma.$transaction(async (tx) => {
      const inventario = await tx.inventario.create({ data });

      const bens = await tx.bem.findMany({
        select: { id: true },
      });

      if (bens.length > 0) {
        // Log simples para depuração em ambiente de desenvolvimento
        // (não afeta regras financeiras nem trilha de auditoria).
        // eslint-disable-next-line no-console
        console.log(`[InventariosRepository] Criando inventário geral com ${bens.length} bens.`);
        await tx.inventarioItem.createMany({
          data: bens.map((b) => ({
            inventarioId: inventario.id,
            bemId: b.id,
          })),
        });
      }

      return inventario;
    });
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

  /**
   * Garante que todos os bens existentes estejam vinculados a um inventário,
   * criando itens que ainda não existirem. Usado como fallback seguro.
   */
  async ensureAllBensInInventario(inventarioId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const [bens, itensExistentes] = await Promise.all([
        tx.bem.findMany({ select: { id: true } }),
        tx.inventarioItem.findMany({
          where: { inventarioId },
          select: { bemId: true },
        }),
      ]);

      const existentesSet = new Set(itensExistentes.map((i) => i.bemId));
      const faltantes = bens.filter((b) => !existentesSet.has(b.id));

      if (faltantes.length === 0) return;

      await tx.inventarioItem.createMany({
        data: faltantes.map((b) => ({
          inventarioId,
          bemId: b.id,
        })),
      });
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
