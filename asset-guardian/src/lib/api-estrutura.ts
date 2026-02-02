/**
 * API de estrutura organizacional (unidades, prédios, andares, setores)
 */

import { apiGet, apiPost } from './api';

export interface UnidadeItem {
  id: string;
  nome: string;
  codigo: string | null;
}

export interface PredioItem {
  id: string;
  unidadeId: string;
  nome: string;
  codigo: string | null;
}

export interface AndarItem {
  id: string;
  predioId: string;
  nome: string;
  codigo: string | null;
}

export interface SetorItem {
  id: string;
  andarId: string;
  centroCustoId: string | null;
  nome: string;
  codigo: string | null;
}

export interface CentroCustoItem {
  id: string;
  codigo: string;
  descricao: string;
}

export function fetchUnidades(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: UnidadeItem[]; total: number }>(`/estrutura/unidades${q ? `?${q}` : ''}`);
}

export function fetchPredios(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: PredioItem[]; total: number }>(`/estrutura/predios${q ? `?${q}` : ''}`);
}

export function fetchPrediosByUnidade(unidadeId: string) {
  return apiGet<Array<{ id: string; nome: string; codigo: string | null }>>(
    `/estrutura/predios/unidade/${unidadeId}`
  );
}

export function fetchAndares(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: AndarItem[]; total: number }>(`/estrutura/andares${q ? `?${q}` : ''}`);
}

export function fetchAndaresByPredio(predioId: string) {
  return apiGet<Array<{ id: string; nome: string; codigo: string | null }>>(
    `/estrutura/andares/predio/${predioId}`
  );
}

export function fetchSetores(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: SetorItem[]; total: number }>(`/estrutura/setores${q ? `?${q}` : ''}`);
}

export function fetchSetoresByAndar(andarId: string) {
  return apiGet<Array<{ id: string; nome: string; codigo: string | null }>>(
    `/estrutura/setores/andar/${andarId}`
  );
}

export function createUnidade(body: { nome: string; codigo?: string }) {
  return apiPost<UnidadeItem>('/estrutura/unidades', body);
}

export function createPredio(body: { unidadeId: string; nome: string; codigo?: string }) {
  return apiPost<PredioItem>('/estrutura/predios', body);
}

export function createAndar(body: { predioId: string; nome: string; codigo?: string }) {
  return apiPost<AndarItem>('/estrutura/andares', body);
}

export function createSetor(body: {
  andarId: string;
  centroCustoId?: string | null;
  nome: string;
  codigo?: string;
}) {
  return apiPost<SetorItem>('/estrutura/setores', body);
}

export function fetchCentrosCusto(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: CentroCustoItem[]; total: number }>(
    `/estrutura/centros-custo${q ? `?${q}` : ''}`
  );
}

export function createCentroCusto(body: { codigo: string; descricao: string }) {
  return apiPost<CentroCustoItem>('/estrutura/centros-custo', body);
}
