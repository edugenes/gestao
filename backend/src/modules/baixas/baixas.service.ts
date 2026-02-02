import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SituacaoBem } from '@prisma/client';
import { BaixasRepository } from './baixas.repository';
import { BensService } from '../bens/bens.service';
import type { CreateBaixaDto } from './dto/create-baixa.dto';

@Injectable()
export class BaixasService {
  constructor(
    private readonly repository: BaixasRepository,
    private readonly bensService: BensService,
  ) {}

  async create(dto: CreateBaixaDto, userId: string | null): Promise<BaixaResponse> {
    const bem = await this.bensService.findById(dto.bemId);
    if (bem.situacao === 'BAIXADO') throw new BadRequestException('Bem já possui baixa patrimonial');
    const existing = await this.repository.findByBemId(dto.bemId);
    if (existing) throw new BadRequestException('Bem já possui baixa patrimonial');
    const dataBaixa = new Date(dto.dataBaixa);
    const valorRealizado =
      dto.valorRealizado !== undefined && dto.valorRealizado !== null
        ? new Decimal(dto.valorRealizado)
        : null;
    const baixa = await this.repository.create({
      bemId: dto.bemId,
      dataBaixa,
      motivo: dto.motivo,
      valorRealizado,
      observacoes: dto.observacoes ?? null,
      userId,
    });
    await this.bensService.updateSituacao(dto.bemId, SituacaoBem.BAIXADO);
    return this.toResponse(baixa);
  }

  async findMany(page = 1, limit = 20): Promise<{ data: BaixaResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return { data: data.map((b) => this.toResponse(b)), total };
  }

  async findById(id: string): Promise<BaixaResponse> {
    const baixa = await this.repository.findById(id);
    if (!baixa) throw new NotFoundException('Baixa não encontrada');
    return this.toResponse(baixa);
  }

  async findByBem(bemId: string): Promise<BaixaResponse | null> {
    await this.bensService.findById(bemId);
    const baixa = await this.repository.findByBemId(bemId);
    return baixa ? this.toResponse(baixa) : null;
  }

  private toResponse(b: {
    id: string;
    bemId: string;
    dataBaixa: Date;
    motivo: string;
    valorRealizado: unknown;
    observacoes: string | null;
    bem?: { numeroPatrimonial: string };
  }): BaixaResponse {
    return {
      id: b.id,
      bemId: b.bemId,
      numeroPatrimonial: b.bem?.numeroPatrimonial,
      dataBaixa: b.dataBaixa.toISOString(),
      motivo: b.motivo,
      valorRealizado: b.valorRealizado != null ? Number(b.valorRealizado) : null,
      observacoes: b.observacoes,
    };
  }
}

export interface BaixaResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string;
  dataBaixa: string;
  motivo: string;
  valorRealizado: number | null;
  observacoes: string | null;
}
