/**
 * API de baixas patrimoniais (backend Patrimônio).
 */

import { apiGet, apiPost } from './api';

export type MotivoBaixa = 'OBSOLESCENCIA' | 'PERDA' | 'DOACAO' | 'VENDA';

export interface BaixaResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string | null;
  dataBaixa: string;
  motivo: string;
  valorRealizado: number | null;
  observacoes: string | null;
}

export interface CreateBaixaBody {
  bemId: string;
  dataBaixa: string;
  motivo: MotivoBaixa;
  valorRealizado?: number | null;
  observacoes?: string | null;
}

export function fetchBaixas(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: BaixaResponse[]; total: number }>(
    `/baixas${q ? `?${q}` : ''}`
  );
}

export function createBaixa(body: CreateBaixaBody) {
  return apiPost<BaixaResponse>('/baixas', body);
}
