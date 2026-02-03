import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { DepreciacoesRepository } from './depreciacoes.repository';
import { BensService } from '../bens/bens.service';
import type { CreateDepreciacaoDto } from './dto/create-depreciacao.dto';

@Injectable()
export class DepreciacoesService {
  constructor(
    private readonly repository: DepreciacoesRepository,
    private readonly bensService: BensService,
  ) {}

  async create(dto: CreateDepreciacaoDto): Promise<DepreciacaoResponse> {
    await this.bensService.findById(dto.bemId);
    const [y, m] = dto.mesReferencia.split('-').map(Number);
    const mesReferencia = new Date(y, m - 1, 1);
    const existing = await this.repository.findByBemAndMes(dto.bemId, mesReferencia);
    if (existing) throw new BadRequestException('Já existe depreciação para este bem neste mês');
    const dep = await this.repository.create({
      bemId: dto.bemId,
      mesReferencia,
      valorDepreciado: new Decimal(dto.valorDepreciado),
      metodo: dto.metodo,
    });
    return this.toResponse(dep);
  }

  async findMany(page = 1, limit = 20, bemId?: string): Promise<{ data: DepreciacaoResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit, bemId),
      this.repository.count(bemId),
    ]);
    return { data: data.map((d) => this.toResponse(d)), total };
  }

  async findById(id: string): Promise<DepreciacaoResponse> {
    const dep = await this.repository.findById(id);
    if (!dep) throw new NotFoundException('Depreciação não encontrada');
    return this.toResponse(dep);
  }

  async findByBem(bemId: string): Promise<DepreciacaoResponse[]> {
    await this.bensService.findById(bemId);
    const list = await this.repository.findManyByBemId(bemId);
    return list.map((d) => this.toResponse(d));
  }

  /**
   * Calcula e registra a depreciação mensal (método linear) para todos os bens elegíveis
   * que ainda não possuem registro no mês. Pode ser chamado por job/cron ou manualmente.
   */
  async calcularMensal(mesReferencia: string, metodo: 'LINEAR' | 'ACELERADA' = 'LINEAR'): Promise<{ processados: number; criados: number }> {
    const [y, m] = mesReferencia.split('-').map(Number);
    if (!y || !m || m < 1 || m > 12) throw new BadRequestException('mesReferencia deve ser YYYY-MM');
    const ref = new Date(y, m - 1, 1);
    const bens = await this.bensService.findManyEligibleForDepreciacao(ref);
    let criados = 0;
    for (const bem of bens) {
      const existing = await this.repository.findByBemAndMes(bem.id, ref);
      if (existing) continue;
      const vidaUtil = bem.vidaUtilMeses > 0 ? bem.vidaUtilMeses : 60;
      const valorDep = Number(bem.valorAquisicao) / vidaUtil;
      await this.repository.create({
        bemId: bem.id,
        mesReferencia: ref,
        valorDepreciado: new Decimal(Math.round(valorDep * 100) / 100),
        metodo,
      });
      criados++;
    }
    return { processados: bens.length, criados };
  }

  private toResponse(d: {
    id: string;
    bemId: string;
    mesReferencia: Date;
    valorDepreciado: unknown;
    metodo: string;
    bem?: { numeroPatrimonial: string };
  }): DepreciacaoResponse {
    return {
      id: d.id,
      bemId: d.bemId,
      numeroPatrimonial: d.bem?.numeroPatrimonial,
      mesReferencia: d.mesReferencia.toISOString().slice(0, 7),
      valorDepreciado: Number(d.valorDepreciado),
      metodo: d.metodo,
    };
  }
}

export interface DepreciacaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string;
  mesReferencia: string;
  valorDepreciado: number;
  metodo: string;
}
