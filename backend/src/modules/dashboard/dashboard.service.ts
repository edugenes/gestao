import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export interface DashboardStats {
  totalBens: number;
  totalValorPatrimonial: number;
  depreciacaoMensal: number;
  /** Mês de referência da depreciação mensal (YYYY-MM), quando houver dados */
  mesReferenciaDepreciacao: string | null;
  pendencias: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const [totalBens, valorAgg, depAgg, pendencias] = await Promise.all([
      this.prisma.bem.count({ where: { deletedAt: null } }),
      this.prisma.bem.aggregate({
        where: {
          deletedAt: null,
          situacao: { not: 'BAIXADO' },
        },
        _sum: { valorAquisicao: true },
      }),
      this.getDepreciacaoMensalAggregate(),
      this.getPendenciasCount(),
    ]);

    const totalValorPatrimonial = Number(valorAgg._sum.valorAquisicao ?? 0);
    const { valor: depreciacaoMensal, mesRef } = depAgg;

    return {
      totalBens,
      totalValorPatrimonial,
      depreciacaoMensal,
      mesReferenciaDepreciacao: mesRef,
      pendencias,
    };
  }

  /**
   * Retorna a soma da depreciação do mês mais recente que possuir registros no banco.
   * Assim o card mostra valor mesmo quando os dados são de meses passados (ex.: seed 2024).
   */
  private async getDepreciacaoMensalAggregate(): Promise<{
    valor: number;
    mesRef: string | null;
  }> {
    const maisRecente = await this.prisma.depreciacao.findFirst({
      orderBy: { mesReferencia: 'desc' },
      select: { mesReferencia: true },
    });
    if (!maisRecente) {
      return { valor: 0, mesRef: null };
    }
    const ref = new Date(maisRecente.mesReferencia);
    const inicioMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const fimMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    const result = await this.prisma.depreciacao.aggregate({
      where: {
        mesReferencia: { gte: inicioMes, lte: fimMes },
      },
      _sum: { valorDepreciado: true },
    });
    const valor = Number(result._sum.valorDepreciado ?? 0);
    const mesRef = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`;
    return { valor, mesRef };
  }

  private async getPendenciasCount(): Promise<number> {
    return this.prisma.inventarioItem.count({
      where: {
        conferido: false,
        inventario: { status: 'ABERTO' },
      },
    });
  }

  /**
   * Retorna histórico de depreciação agregado por mês (últimos 6 meses).
   * Para cada mês, calcula o valor patrimonial líquido (valor aquisição - depreciação acumulada).
   */
  async getDepreciacaoHistorico(): Promise<Array<{ mes: string; valorPatrimonial: number; depreciacaoMensal: number }>> {
    // Busca os últimos 6 meses com depreciação registrada
    const depreciacoes = await this.prisma.depreciacao.findMany({
      orderBy: { mesReferencia: 'desc' },
      take: 1000, // Limite razoável para processar
      select: {
        mesReferencia: true,
        valorDepreciado: true,
      },
    });

    if (depreciacoes.length === 0) {
      return [];
    }

    // Agrupa por mês e soma depreciação mensal
    const porMes = new Map<string, number>();
    for (const dep of depreciacoes) {
      const mes = dep.mesReferencia.getMonth() + 1;
      const mesKey = `${dep.mesReferencia.getFullYear()}-${String(mes).padStart(2, '0')}`;
      const atual = porMes.get(mesKey) ?? 0;
      porMes.set(mesKey, atual + Number(dep.valorDepreciado));
    }

    // Pega os últimos 6 meses únicos
    const mesesUnicos = Array.from(porMes.keys())
      .sort()
      .reverse()
      .slice(0, 6)
      .reverse();

    if (mesesUnicos.length === 0) {
      return [];
    }

    // Busca valor patrimonial total uma única vez (aproximação: valor atual)
    const valorTotal = Number(
      (
        await this.prisma.bem.aggregate({
          where: { deletedAt: null, situacao: { not: 'BAIXADO' } },
          _sum: { valorAquisicao: true },
        })
      )._sum.valorAquisicao ?? 0
    );

    // Para cada mês, calcula valor patrimonial líquido
    // O valor patrimonial diminui ao longo do tempo (depreciação acumulada cresce)
    const resultado = [];
    let depAcumulada = 0;
    for (const mes of mesesUnicos) {
      const depreciacaoMensal = porMes.get(mes) ?? 0;
      // Acumula depreciação ao longo dos meses (do mais antigo para o mais recente)
      depAcumulada += depreciacaoMensal;
      resultado.push({
        mes,
        valorPatrimonial: Math.max(0, valorTotal - depAcumulada),
        depreciacaoMensal,
      });
    }

    return resultado;
  }

  /**
   * Retorna contagem de bens por situação (status).
   */
  async getBensPorSituacao(): Promise<Array<{ situacao: string; quantidade: number }>> {
    const result = await this.prisma.bem.groupBy({
      by: ['situacao'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    return result.map((r) => ({
      situacao: r.situacao,
      quantidade: r._count.id,
    }));
  }
}
