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
}
