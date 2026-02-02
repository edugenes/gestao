import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { BensRepository, type ListBensFilter } from './bens.repository';
import { BensHistoricoRepository } from './bens-historico.repository';
import { SetoresService } from '../estrutura-organizacional/setores/setores.service';
import { SubcategoriasRepository } from './subcategorias/subcategorias.repository';
import type { CreateBemDto } from './dto/create-bem.dto';
import type { UpdateBemDto } from './dto/update-bem.dto';
import type { Bem } from '@prisma/client';
import { SituacaoBem } from '@prisma/client';

function serializeForHistorico(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return (value as Decimal).toString();
  }
  return String(value);
}

@Injectable()
export class BensService {
  constructor(
    private readonly repository: BensRepository,
    private readonly historicoRepository: BensHistoricoRepository,
    private readonly setoresService: SetoresService,
    private readonly subcategoriasRepository: SubcategoriasRepository,
  ) {}

  async create(dto: CreateBemDto): Promise<BemResponse> {
    const existing = await this.repository.findByNumeroPatrimonial(dto.numeroPatrimonial);
    if (existing) throw new ConflictException('Número patrimonial já cadastrado');
    await this.setoresService.findById(dto.setorId);
    if (dto.subcategoriaId) {
      const sub = await this.subcategoriasRepository.findById(dto.subcategoriaId);
      if (!sub) throw new NotFoundException('Subcategoria não encontrada');
    }
    const dataAquisicao = new Date(dto.dataAquisicao);
    const bem = await this.repository.create({
      numeroPatrimonial: dto.numeroPatrimonial,
      setorId: dto.setorId,
      subcategoriaId: dto.subcategoriaId ?? null,
      marca: dto.marca ?? null,
      modelo: dto.modelo ?? null,
      numeroSerie: dto.numeroSerie ?? null,
      valorAquisicao: new Decimal(dto.valorAquisicao),
      dataAquisicao,
      vidaUtilMeses: dto.vidaUtilMeses,
      estadoConservacao: dto.estadoConservacao,
      situacao: dto.situacao ?? 'EM_USO',
      observacoes: dto.observacoes ?? null,
    });
    return this.toResponse(bem);
  }

  async findMany(
    filter: { setorId?: string; situacao?: string; numeroPatrimonial?: string },
    page = 1,
    limit = 20,
  ): Promise<{ data: BemResponse[]; total: number }> {
    const f: ListBensFilter = {};
    if (filter.setorId) f.setorId = filter.setorId;
    if (filter.situacao) f.situacao = filter.situacao as ListBensFilter['situacao'];
    if (filter.numeroPatrimonial) f.numeroPatrimonial = filter.numeroPatrimonial;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(f, skip, limit),
      this.repository.count(f),
    ]);
    return {
      data: data.map((b) => this.toResponse(b)),
      total,
    };
  }

  async findById(id: string): Promise<BemResponse> {
    const bem = await this.repository.findById(id);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    return this.toResponse(bem);
  }

  async findHistorico(bemId: string, limit = 100): Promise<HistoricoItem[]> {
    const bem = await this.repository.findById(bemId);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    return this.historicoRepository.findManyByBemId(bemId, limit);
  }

  /** Usado pelo módulo de movimentações: transferência altera setor e registra histórico. */
  async updateSetorFromMovimentacao(bemId: string, newSetorId: string, userId: string | null): Promise<void> {
    const bem = await this.repository.findById(bemId);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    if (bem.setorId === newSetorId) return;
    await this.setoresService.findById(newSetorId);
    await this.repository.update(bemId, { setorId: newSetorId });
    await this.historicoRepository.create({
      bemId,
      campo: 'setorId',
      valorAnterior: bem.setorId,
      valorNovo: newSetorId,
      userId,
    });
  }

  /** Usado pelo módulo de movimentações: empréstimo/devolução altera situação. */
  async updateSituacao(bemId: string, situacao: SituacaoBem): Promise<void> {
    const bem = await this.repository.findById(bemId);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    await this.repository.update(bemId, { situacao });
  }

  async update(id: string, dto: UpdateBemDto, userId: string | null): Promise<BemResponse> {
    const bem = await this.repository.findById(id);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    if (dto.setorId) {
      await this.setoresService.findById(dto.setorId);
    }
    if (dto.subcategoriaId !== undefined && dto.subcategoriaId !== null) {
      const sub = await this.subcategoriasRepository.findById(dto.subcategoriaId);
      if (!sub) throw new NotFoundException('Subcategoria não encontrada');
    }

    const updateData: Parameters<BensRepository['update']>[1] = {};
    const camposParaHistorico: Array<{ campo: string; valorAnterior: unknown; valorNovo: unknown }> = [];

    if (dto.setorId !== undefined && dto.setorId !== bem.setorId) {
      updateData.setorId = dto.setorId;
      camposParaHistorico.push({ campo: 'setorId', valorAnterior: bem.setorId, valorNovo: dto.setorId });
    }
    if (dto.subcategoriaId !== undefined && (dto.subcategoriaId ?? null) !== (bem.subcategoriaId ?? null)) {
      updateData.subcategoriaId = dto.subcategoriaId ?? null;
      camposParaHistorico.push({
        campo: 'subcategoriaId',
        valorAnterior: bem.subcategoriaId,
        valorNovo: dto.subcategoriaId ?? null,
      });
    }
    if (dto.marca !== undefined && dto.marca !== bem.marca) {
      updateData.marca = dto.marca;
      camposParaHistorico.push({ campo: 'marca', valorAnterior: bem.marca, valorNovo: dto.marca });
    }
    if (dto.modelo !== undefined && dto.modelo !== bem.modelo) {
      updateData.modelo = dto.modelo;
      camposParaHistorico.push({ campo: 'modelo', valorAnterior: bem.modelo, valorNovo: dto.modelo });
    }
    if (dto.numeroSerie !== undefined && dto.numeroSerie !== bem.numeroSerie) {
      updateData.numeroSerie = dto.numeroSerie;
      camposParaHistorico.push({ campo: 'numeroSerie', valorAnterior: bem.numeroSerie, valorNovo: dto.numeroSerie });
    }
    if (dto.valorAquisicao !== undefined) {
      const novoValor = new Decimal(dto.valorAquisicao);
      if (!novoValor.equals(bem.valorAquisicao)) {
        updateData.valorAquisicao = novoValor;
        camposParaHistorico.push({
          campo: 'valorAquisicao',
          valorAnterior: bem.valorAquisicao,
          valorNovo: novoValor,
        });
      }
    }
    if (dto.dataAquisicao !== undefined) {
      const novaData = new Date(dto.dataAquisicao);
      if (novaData.getTime() !== bem.dataAquisicao.getTime()) {
        updateData.dataAquisicao = novaData;
        camposParaHistorico.push({
          campo: 'dataAquisicao',
          valorAnterior: bem.dataAquisicao,
          valorNovo: novaData,
        });
      }
    }
    if (dto.vidaUtilMeses !== undefined && dto.vidaUtilMeses !== bem.vidaUtilMeses) {
      updateData.vidaUtilMeses = dto.vidaUtilMeses;
      camposParaHistorico.push({
        campo: 'vidaUtilMeses',
        valorAnterior: bem.vidaUtilMeses,
        valorNovo: dto.vidaUtilMeses,
      });
    }
    if (dto.estadoConservacao !== undefined && dto.estadoConservacao !== bem.estadoConservacao) {
      updateData.estadoConservacao = dto.estadoConservacao;
      camposParaHistorico.push({
        campo: 'estadoConservacao',
        valorAnterior: bem.estadoConservacao,
        valorNovo: dto.estadoConservacao,
      });
    }
    if (dto.situacao !== undefined && dto.situacao !== bem.situacao) {
      updateData.situacao = dto.situacao;
      camposParaHistorico.push({ campo: 'situacao', valorAnterior: bem.situacao, valorNovo: dto.situacao });
    }
    if (dto.observacoes !== undefined && (dto.observacoes ?? '') !== (bem.observacoes ?? '')) {
      updateData.observacoes = dto.observacoes ?? null;
      camposParaHistorico.push({
        campo: 'observacoes',
        valorAnterior: bem.observacoes,
        valorNovo: dto.observacoes ?? null,
      });
    }
    if (dto.active !== undefined && dto.active !== bem.active) {
      updateData.active = dto.active;
      camposParaHistorico.push({ campo: 'active', valorAnterior: bem.active, valorNovo: dto.active });
    }

    for (const { campo, valorAnterior, valorNovo } of camposParaHistorico) {
      await this.historicoRepository.create({
        bemId: id,
        campo,
        valorAnterior: serializeForHistorico(valorAnterior),
        valorNovo: serializeForHistorico(valorNovo),
        userId,
      });
    }

    const updated = Object.keys(updateData).length > 0
      ? await this.repository.update(id, updateData)
      : bem;
    return this.toResponse(updated as Bem & { setor?: { id: string; nome: string }; subcategoria?: { id: string; nome: string } | null });
  }

  async softDelete(id: string): Promise<void> {
    const bem = await this.repository.findById(id);
    if (!bem) throw new NotFoundException('Bem não encontrado');
    await this.repository.softDelete(id);
  }

  private toResponse(bem: Bem & { setor?: { id?: string; nome: string }; subcategoria?: { id?: string; nome: string } | null }): BemResponse {
    return {
      id: bem.id,
      numeroPatrimonial: bem.numeroPatrimonial,
      setorId: bem.setorId,
      setorNome: bem.setor?.nome,
      subcategoriaId: bem.subcategoriaId,
      subcategoriaNome: bem.subcategoria?.nome,
      marca: bem.marca,
      modelo: bem.modelo,
      numeroSerie: bem.numeroSerie,
      valorAquisicao: Number(bem.valorAquisicao),
      dataAquisicao: bem.dataAquisicao.toISOString(),
      vidaUtilMeses: bem.vidaUtilMeses,
      estadoConservacao: bem.estadoConservacao,
      situacao: bem.situacao,
      observacoes: bem.observacoes,
      active: bem.active,
    };
  }
}

export interface BemResponse {
  id: string;
  numeroPatrimonial: string;
  setorId: string;
  setorNome?: string;
  subcategoriaId: string | null;
  subcategoriaNome?: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  valorAquisicao: number;
  dataAquisicao: string;
  vidaUtilMeses: number;
  estadoConservacao: string;
  situacao: string;
  observacoes: string | null;
  active: boolean;
}

export interface HistoricoItem {
  id: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  userId: string | null;
  createdAt: Date;
}
