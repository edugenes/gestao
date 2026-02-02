/**
 * API de manutenções e fornecedores (backend Patrimônio).
 */

import { apiGet, apiPost, apiPatch } from './api';

export type TipoManutencao = 'PREVENTIVA' | 'CORRETIVA';

export interface ManutencaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string | null;
  tipo: string;
  dataInicio: string;
  dataFim: string | null;
  custo: number | null;
  fornecedorId: string | null;
  fornecedorNome?: string | null;
  observacoes: string | null;
}

export interface CreateManutencaoBody {
  bemId: string;
  tipo: TipoManutencao;
  dataInicio: string;
  dataFim?: string | null;
  custo?: number | null;
  fornecedorId?: string | null;
  observacoes?: string | null;
}

export interface FornecedorItem {
  id: string;
  nome: string;
  contato: string | null;
}

export function fetchManutencoes(params: {
  page?: number;
  limit?: number;
  bemId?: string;
} = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.bemId) sp.set('bemId', params.bemId);
  const q = sp.toString();
  return apiGet<{ data: ManutencaoResponse[]; total: number }>(
    `/manutencoes${q ? `?${q}` : ''}`
  );
}

export function createManutencao(body: CreateManutencaoBody) {
  return apiPost<ManutencaoResponse>('/manutencoes', body);
}

export function fetchFornecedores(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: FornecedorItem[]; total: number }>(
    `/manutencoes/fornecedores${q ? `?${q}` : ''}`
  );
}
