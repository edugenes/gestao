/**
 * API de depreciações (backend Patrimônio).
 */

import { apiGet, apiPost } from './api';

export type MetodoDepreciacao = 'LINEAR' | 'ACELERADA';

export interface DepreciacaoResponse {
  id: string;
  bemId: string;
  numeroPatrimonial?: string | null;
  mesReferencia: string;
  valorDepreciado: number;
  metodo: string;
}

export interface CreateDepreciacaoBody {
  bemId: string;
  mesReferencia: string;
  valorDepreciado: number;
  metodo: MetodoDepreciacao;
}

export function fetchDepreciacoes(params: {
  page?: number;
  limit?: number;
  bemId?: string;
} = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.bemId) sp.set('bemId', params.bemId);
  const q = sp.toString();
  return apiGet<{ data: DepreciacaoResponse[]; total: number }>(
    `/depreciacoes${q ? `?${q}` : ''}`
  );
}

export function createDepreciacao(body: CreateDepreciacaoBody) {
  return apiPost<DepreciacaoResponse>('/depreciacoes', body);
}
