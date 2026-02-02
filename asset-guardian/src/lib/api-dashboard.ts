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
