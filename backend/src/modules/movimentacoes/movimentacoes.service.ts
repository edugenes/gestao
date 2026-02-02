import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BensService } from '../bens/bens.service';
import { SetoresService } from '../estrutura-organizacional/setores/setores.service';
import { MovimentacoesRepository } from './movimentacoes.repository';
import type { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { SituacaoBem } from '@prisma/client';

@Injectable()
export class MovimentacoesService {
  constructor(
    private readonly repository: MovimentacoesRepository,
    private readonly bensService: BensService,
    private readonly setoresService: SetoresService,
  ) {}

  async create(dto: CreateMovimentacaoDto, userId: string | null): Promise<MovimentacaoResponse> {
    const bem = await this.bensService.findById(dto.bemId);
    if (bem.situacao === 'BAIXADO')
      throw new BadRequestException('Não é possível movimentar bem com baixa patrimonial');
    if (dto.setorOrigemId) {
      await this.setoresService.findById(dto.setorOrigemId);
    }
    if (dto.setorDestinoId) {
      await this.setoresService.findById(dto.setorDestinoId);
    }
    const dataMovimentacao = new Date(dto.dataMovimentacao);
    const dataDevolucao = dto.dataDevolucao ? new Date(dto.dataDevolucao) : null;

    const mov = await this.repository.create({
      bemId: dto.bemId,
      tipo: dto.tipo,
      setorOrigemId: dto.setorOrigemId ?? null,
      setorDestinoId: dto.setorDestinoId ?? null,
      dataMovimentacao,
      dataDevolucao,
      observacoes: dto.observacoes ?? null,
      userId,
    });

    if (dto.tipo === 'TRANSFERENCIA' && dto.setorDestinoId && bem.setorId !== dto.setorDestinoId) {
      await this.bensService.updateSetorFromMovimentacao(dto.bemId, dto.setorDestinoId, userId);
    }
    if (dto.tipo === 'EMPRESTIMO') {
      await this.bensService.updateSituacao(dto.bemId, SituacaoBem.OCIOSO);
    }
    if (dto.tipo === 'DEVOLUCAO') {
      await this.bensService.updateSituacao(dto.bemId, SituacaoBem.EM_USO);
    }

    return this.toResponse(mov);
  }

  async findMany(page = 1, limit = 20, bemId?: string): Promise<{ data: MovimentacaoResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit, bemId),
      this.repository.count(bemId),
    ]);
    return { data: data.map((m) => this.toResponse(m)), total };
  }

  async findById(id: string): Promise<MovimentacaoResponse> {
    const mov = await this.repository.findById(id);
    if (!mov) throw new NotFoundException('Movimentação não encontrada');
    return this.toResponse(mov);
  }

  async findByBem(bemId: string, limit = 50): Promise<MovimentacaoResponse[]> {
    await this.bensService.findById(bemId);
    const list = await this.repository.findManyByBemId(bemId, limit);
    return list.map((m) => this.toResponse(m));
  }

  private toResponse(m: {
    id: string;
    bemId: string;
    tipo: string;
    setorOrigemId: string | null;
    setorDestinoId: string | null;
    dataMovimentacao: Date;
    dataDevolucao: Date | null;
    observacoes: string | null;
    bem?: { numeroPatrimonial: string };
    setorOrigem?: { id: string; nome: string } | null;
    setorDestino?: { id: string; nome: string } | null;
  }): MovimentacaoResponse {
    return {
      id: m.id,
      bemId: m.bemId,
      numeroPatrimonial: m.bem?.numeroPatrimonial,
      tipo: m.tipo,
      setorOrigemId: m.setorOrigemId,
      setorOrigemNome: m.setorOrigem?.nome,
      setorDestinoId: m.setorDestinoId,
      setorDestinoNome: m.setorDestino?.nome,
      dataMovimentacao: m.dataMovimentacao.toISOString(),
      dataDevolucao: m.dataDevolucao?.toISOString() ?? null,
      observacoes: m.observacoes,
    };
  }
}

export interface MovimentacaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string;
  tipo: string;
  setorOrigemId: string | null;
  setorOrigemNome?: string | null;
  setorDestinoId: string | null;
  setorDestinoNome?: string | null;
  dataMovimentacao: string;
  dataDevolucao: string | null;
  observacoes: string | null;
}
