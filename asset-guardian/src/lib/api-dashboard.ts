/**
 * API de estatísticas do dashboard (backend Patrimônio).
 */

import { apiGet } from './api';

export interface DashboardStatsResponse {
  totalBens: number;
  totalValorPatrimonial: number;
  depreciacaoMensal: number;
  /** Mês de referência (YYYY-MM) quando houver depreciação */
  mesReferenciaDepreciacao: string | null;
  pendencias: number;
}

export function fetchDashboardStats() {
  return apiGet<DashboardStatsResponse>('/dashboard/stats');
}

export interface DepreciacaoHistoricoItem {
  mes: string; // YYYY-MM
  valorPatrimonial: number;
  depreciacaoMensal: number;
}

export function fetchDepreciacaoHistorico() {
  return apiGet<DepreciacaoHistoricoItem[]>('/dashboard/depreciacao-historico');
}

export interface BensPorSituacaoItem {
  situacao: string;
  quantidade: number;
}

export function fetchBensPorSituacao() {
  return apiGet<BensPorSituacaoItem[]>('/dashboard/bens-por-situacao');
}

/**
 * Helper para invalidar todas as queries do dashboard de uma vez.
 * Use após operações que alteram bens, depreciações, inventários, movimentações ou baixas.
 */
export function invalidateDashboardQueries(queryClient: { invalidateQueries: (options: { queryKey: readonly string[] }) => void }) {
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-depreciacao-historico'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-bens-por-situacao'] });
}
