import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StatusInventario } from '@prisma/client';
import { InventariosRepository } from './inventarios.repository';
import { BensService } from '../bens/bens.service';
import type { CreateInventarioDto } from './dto/create-inventario.dto';
import type { CreateInventarioItemDto } from './dto/create-inventario-item.dto';
import type { UpdateInventarioItemDto } from './dto/update-inventario-item.dto';

@Injectable()
export class InventariosService {
  constructor(
    private readonly repository: InventariosRepository,
    private readonly bensService: BensService,
  ) {}

  async createInventario(dto: CreateInventarioDto): Promise<InventarioResponse> {
    const dataInicio = new Date(dto.dataInicio);
    const inv = await this.repository.createInventario({
      descricao: dto.descricao,
      dataInicio,
    });
    return this.toInventarioResponse(inv);
  }

  async findInventarios(
    page = 1,
    limit = 20,
    status?: StatusInventario,
  ): Promise<{ data: InventarioResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findInventarios(skip, limit, status),
      this.repository.countInventarios(status),
    ]);
    return {
      data: data.map((i) => this.toInventarioResponse(i)),
      total,
    };
  }

  async findInventarioById(id: string): Promise<InventarioResponse> {
    const inv = await this.repository.findInventarioById(id);
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    return this.toInventarioResponse(inv);
  }

  async closeInventario(id: string): Promise<InventarioResponse> {
    const inv = await this.repository.findInventarioById(id);
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    if (inv.status === 'FECHADO') throw new BadRequestException('Inventário já está fechado');
    const updated = await this.repository.updateInventarioStatus(id, StatusInventario.FECHADO, new Date());
    return this.toInventarioResponse(updated);
  }

  async addItem(dto: CreateInventarioItemDto, userId: string | null): Promise<InventarioItemResponse> {
    const inv = await this.repository.findInventarioById(dto.inventarioId);
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    if (inv.status === 'FECHADO') throw new BadRequestException('Não é possível adicionar itens a inventário fechado');
    await this.bensService.findById(dto.bemId);
    const existing = await this.repository.findItemByInventarioAndBem(dto.inventarioId, dto.bemId);
    if (existing) throw new BadRequestException('Bem já está neste inventário');
    const item = await this.repository.createItem({
      inventarioId: dto.inventarioId,
      bemId: dto.bemId,
      divergencia: dto.divergencia ?? null,
      userId,
    });
    return this.toItemResponse(item);
  }

  async findItensByInventario(inventarioId: string): Promise<InventarioItemResponse[]> {
    const inv = await this.repository.findInventarioById(inventarioId);
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    const itens = await this.repository.findItensByInventario(inventarioId);
    return itens.map((i) => this.toItemResponse(i));
  }

  async updateItem(id: string, dto: UpdateInventarioItemDto, userId: string | null): Promise<InventarioItemResponse> {
    const item = await this.repository.findItemById(id);
    if (!item) throw new NotFoundException('Item do inventário não encontrado');
    const updateData: { conferido?: boolean; dataConferencia?: Date | null; userId?: string | null; divergencia?: string | null } = {};
    if (dto.conferido !== undefined) updateData.conferido = dto.conferido;
    if (dto.dataConferencia !== undefined) updateData.dataConferencia = dto.dataConferencia ? new Date(dto.dataConferencia) : null;
    if (dto.divergencia !== undefined) updateData.divergencia = dto.divergencia ?? null;
    if (dto.conferido) updateData.userId = userId;
    const updated = await this.repository.updateItem(id, updateData);
    return this.toItemResponse(updated);
  }

  private toInventarioResponse(i: { id: string; descricao: string; dataInicio: Date; dataFim: Date | null; status: string }): InventarioResponse {
    return {
      id: i.id,
      descricao: i.descricao,
      dataInicio: i.dataInicio.toISOString(),
      dataFim: i.dataFim?.toISOString() ?? null,
      status: i.status,
    };
  }

  private toItemResponse(i: {
    id: string;
    inventarioId: string;
    bemId: string;
    conferido: boolean;
    dataConferencia: Date | null;
    divergencia: string | null;
    bem?: { numeroPatrimonial: string };
  }): InventarioItemResponse {
    return {
      id: i.id,
      inventarioId: i.inventarioId,
      bemId: i.bemId,
      numeroPatrimonial: i.bem?.numeroPatrimonial,
      conferido: i.conferido,
      dataConferencia: i.dataConferencia?.toISOString() ?? null,
      divergencia: i.divergencia,
    };
  }
}

export interface InventarioResponse {
  id: string;
  descricao: string;
  dataInicio: string;
  dataFim: string | null;
  status: string;
}

export interface InventarioItemResponse {
  id: string;
  inventarioId: string;
  bemId: string;
  numeroPatrimonial?: string;
  conferido: boolean;
  dataConferencia: string | null;
  divergencia: string | null;
}
