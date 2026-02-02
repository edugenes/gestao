/**
 * Tipos e funções da API de Bens (backend Patrimônio).
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export interface BemResponse {
  id: string;
  numeroPatrimonial: string;
  setorId: string;
  setorNome?: string;
  subcategoriaId: string | null;
  subcategoriaNome?: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  valorAquisicao: number;
  dataAquisicao: string;
  vidaUtilMeses: number;
  estadoConservacao: string;
  situacao: string;
  observacoes: string | null;
  active: boolean;
}

export interface BensListResponse {
  data: BemResponse[];
  total: number;
}

export interface CreateBemBody {
  numeroPatrimonial: string;
  setorId: string;
  subcategoriaId?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  valorAquisicao: number;
  dataAquisicao: string;
  vidaUtilMeses: number;
  estadoConservacao: string;
  situacao?: string;
  observacoes?: string | null;
}

export interface UpdateBemBody {
  setorId?: string;
  subcategoriaId?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  valorAquisicao?: number;
  dataAquisicao?: string;
  vidaUtilMeses?: number;
  estadoConservacao?: string;
  situacao?: string;
  observacoes?: string | null;
}

export function fetchBens(params: { page?: number; limit?: number; setorId?: string; situacao?: string; numeroPatrimonial?: string } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.setorId) sp.set('setorId', params.setorId);
  if (params.situacao) sp.set('situacao', params.situacao);
  if (params.numeroPatrimonial) sp.set('numeroPatrimonial', params.numeroPatrimonial);
  const q = sp.toString();
  return apiGet<BensListResponse>(`/bens${q ? `?${q}` : ''}`);
}

export function fetchBemById(id: string) {
  return apiGet<BemResponse>(`/bens/${id}`);
}

export function createBem(body: CreateBemBody) {
  return apiPost<BemResponse>('/bens', body);
}

export function updateBem(id: string, body: UpdateBemBody) {
  return apiPatch<BemResponse>(`/bens/${id}`, body);
}

export function deleteBem(id: string) {
  return apiDelete(`/bens/${id}`);
}

export interface BemHistoricoItem {
  id: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  userId: string | null;
  createdAt: string;
}

export function fetchBemHistorico(bemId: string, limit = 100) {
  return apiGet<BemHistoricoItem[]>(`/bens/${bemId}/historico?limit=${limit}`);
}

export interface CategoriaItem {
  id: string;
  nome: string;
  codigo: string | null;
}

export interface SubcategoriaItem {
  id: string;
  categoriaId: string;
  nome: string;
  codigo: string | null;
}

export function fetchCategorias(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: CategoriaItem[]; total: number }>(
    `/bens/categorias${q ? `?${q}` : ''}`
  );
}

export function fetchSubcategorias(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: SubcategoriaItem[]; total: number }>(
    `/bens/subcategorias${q ? `?${q}` : ''}`
  );
}

export function fetchSubcategoriasByCategoria(categoriaId: string) {
  return apiGet<Array<{ id: string; nome: string; codigo: string | null }>>(
    `/bens/subcategorias/categoria/${categoriaId}`
  );
}
