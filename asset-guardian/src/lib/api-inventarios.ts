/**
 * API de inventários (backend Patrimônio).
 */

import { apiGet, apiPost, apiPatch } from './api';

export type StatusInventario = 'ABERTO' | 'FECHADO';

export interface InventarioResponse {
  id: string;
  descricao: string;
  dataInicio: string;
  dataFim: string | null;
  status: string;
}

export interface InventarioItemResponse {
  id: string;
  inventarioId: string;
  bemId: string;
  numeroPatrimonial?: string | null;
  conferido: boolean;
  dataConferencia: string | null;
  divergencia: string | null;
}

export function fetchInventarios(params: {
  page?: number;
  limit?: number;
  status?: StatusInventario;
} = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.status) sp.set('status', params.status);
  const q = sp.toString();
  return apiGet<{ data: InventarioResponse[]; total: number }>(
    `/inventarios${q ? `?${q}` : ''}`
  );
}

export function fetchInventarioById(id: string) {
  return apiGet<InventarioResponse>(`/inventarios/${id}`);
}

export type TipoInventario = 'GERAL' | 'PARCIAL';

export function createInventario(body: { descricao: string; dataInicio: string; tipo?: TipoInventario }) {
  return apiPost<InventarioResponse>('/inventarios', body);
}

export function closeInventario(id: string) {
  return apiPost<InventarioResponse>(`/inventarios/${id}/fechar`, {});
}

export function fetchItensByInventario(inventarioId: string) {
  return apiGet<InventarioItemResponse[]>(`/inventarios/${inventarioId}/itens`);
}

export function addInventarioItem(body: {
  inventarioId: string;
  bemId: string;
  divergencia?: string | null;
}) {
  return apiPost<InventarioItemResponse>('/inventarios/itens', body);
}

export function updateInventarioItem(
  itemId: string,
  body: {
    conferido?: boolean;
    dataConferencia?: string | null;
    divergencia?: string | null;
  }
) {
  return apiPatch<InventarioItemResponse>(`/inventarios/itens/${itemId}`, body);
}
