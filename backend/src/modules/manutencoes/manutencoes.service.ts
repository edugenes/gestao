import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SituacaoBem } from '@prisma/client';
import { ManutencoesRepository } from './manutencoes.repository';
import { FornecedoresRepository } from './fornecedores.repository';
import { BensService } from '../bens/bens.service';
import type { CreateManutencaoDto } from './dto/create-manutencao.dto';
import type { UpdateManutencaoDto } from './dto/update-manutencao.dto';

@Injectable()
export class ManutencoesService {
  constructor(
    private readonly repository: ManutencoesRepository,
    private readonly fornecedoresRepository: FornecedoresRepository,
    private readonly bensService: BensService,
  ) {}

  async create(dto: CreateManutencaoDto): Promise<ManutencaoResponse> {
    await this.bensService.findById(dto.bemId);
    if (dto.fornecedorId) {
      await this.fornecedoresRepository.findById(dto.fornecedorId);
    }
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
    const custo = dto.custo !== undefined && dto.custo !== null ? new Decimal(dto.custo) : null;
    const man = await this.repository.create({
      bemId: dto.bemId,
      tipo: dto.tipo,
      dataInicio,
      dataFim,
      custo,
      fornecedorId: dto.fornecedorId ?? null,
      observacoes: dto.observacoes ?? null,
    });
    await this.bensService.updateSituacao(dto.bemId, SituacaoBem.EM_MANUTENCAO);
    return this.toResponse(man);
  }

  async findMany(page = 1, limit = 20, bemId?: string): Promise<{ data: ManutencaoResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit, bemId),
      this.repository.count(bemId),
    ]);
    return { data: data.map((m) => this.toResponse(m)), total };
  }

  async findById(id: string): Promise<ManutencaoResponse> {
    const man = await this.repository.findById(id);
    if (!man) throw new NotFoundException('Manutenção não encontrada');
    return this.toResponse(man);
  }

  async findByBem(bemId: string): Promise<ManutencaoResponse[]> {
    await this.bensService.findById(bemId);
    const list = await this.repository.findManyByBemId(bemId);
    return list.map((m) => this.toResponse(m));
  }

  async update(id: string, dto: UpdateManutencaoDto): Promise<ManutencaoResponse> {
    const man = await this.repository.findById(id);
    if (!man) throw new NotFoundException('Manutenção não encontrada');
    if (dto.fornecedorId !== undefined && dto.fornecedorId !== null) {
      await this.fornecedoresRepository.findById(dto.fornecedorId);
    }
    const dataFim = dto.dataFim !== undefined ? (dto.dataFim ? new Date(dto.dataFim) : null) : undefined;
    const custo = dto.custo !== undefined ? (dto.custo !== null ? new Decimal(dto.custo) : null) : undefined;
    const updated = await this.repository.update(id, {
      dataFim,
      custo,
      fornecedorId: dto.fornecedorId,
      observacoes: dto.observacoes,
    });
    if (dto.dataFim && !man.dataFim) {
      await this.bensService.updateSituacao(man.bemId, SituacaoBem.EM_USO);
    }
    return this.toResponse(updated);
  }

  private toResponse(m: {
    id: string;
    bemId: string;
    tipo: string;
    dataInicio: Date;
    dataFim: Date | null;
    custo: unknown;
    fornecedorId: string | null;
    observacoes: string | null;
    bem?: { numeroPatrimonial: string };
    fornecedor?: { nome: string } | null;
  }): ManutencaoResponse {
    return {
      id: m.id,
      bemId: m.bemId,
      numeroPatrimonial: m.bem?.numeroPatrimonial,
      tipo: m.tipo,
      dataInicio: m.dataInicio.toISOString(),
      dataFim: m.dataFim?.toISOString() ?? null,
      custo: m.custo != null ? Number(m.custo) : null,
      fornecedorId: m.fornecedorId,
      fornecedorNome: m.fornecedor?.nome,
      observacoes: m.observacoes,
    };
  }
}

export interface ManutencaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string;
  tipo: string;
  dataInicio: string;
  dataFim: string | null;
  custo: number | null;
  fornecedorId: string | null;
  fornecedorNome?: string | null;
  observacoes: string | null;
}
