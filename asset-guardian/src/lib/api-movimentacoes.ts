/**
 * API de movimentações (backend Patrimônio).
 */

import { apiGet, apiPost } from './api';

export type TipoMovimentacao = 'TRANSFERENCIA' | 'EMPRESTIMO' | 'MANUTENCAO' | 'DEVOLUCAO';

export interface MovimentacaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string | null;
  tipo: string;
  setorOrigemId: string | null;
  setorOrigemNome?: string | null;
  setorDestinoId: string | null;
  setorDestinoNome?: string | null;
  dataMovimentacao: string;
  dataDevolucao: string | null;
  observacoes: string | null;
}

export interface CreateMovimentacaoBody {
  bemId: string;
  tipo: TipoMovimentacao;
  setorOrigemId?: string | null;
  setorDestinoId?: string | null;
  dataMovimentacao: string;
  dataDevolucao?: string | null;
  observacoes?: string | null;
}

export function fetchMovimentacoes(params: {
  page?: number;
  limit?: number;
  bemId?: string;
} = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.bemId) sp.set('bemId', params.bemId);
  const q = sp.toString();
  return apiGet<{ data: MovimentacaoResponse[]; total: number }>(
    `/movimentacoes${q ? `?${q}` : ''}`
  );
}

export function createMovimentacao(body: CreateMovimentacaoBody) {
  return apiPost<MovimentacaoResponse>('/movimentacoes', body);
}

export function fetchMovimentacoesByBem(bemId: string, limit = 50) {
  return apiGet<MovimentacaoResponse[]>(`/movimentacoes/bem/${bemId}?limit=${limit}`);
}
